import { Injectable } from '@nestjs/common';
import UserEntity from '@domain/entities/User.entity';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserStrategy from '@app/user/strategies/User.strategy';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import HttpConstants from '@common/constants/Http.constants';
import CreateUserInputDto from '../api/dto/user/CreateUserInput.dto';
import UpdateUserInputDto from '../api/dto/user/UpdateUserInput.dto';
import { UserAuthInterface } from '@shared/interfaces/userAuthInterface';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';


@Injectable()
export default class UserOperation {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly cryptographyService: CryptographyService,
		private readonly userStrategy: UserStrategy,
		private readonly httpConstants: HttpConstants,
		private readonly exceptions: Exceptions,
	) { }

	public async loginUser(data: { email: string, password: string }): Promise<{ user: UserEntity, token: string }> {
		const foundedUser = await this.userService.getByEmail(data.email);

		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'User not founded by e-mail!',
			});

		const user = await this.userService.getById(foundedUser.getId(), false);
		this.userService.validatePassword(user, data.password);

		const preference = await this.userPreferenceService.getByUserId(foundedUser.getId());

		user.setPreference(preference);
		user.setPassword('');

		const userAuthToEncode: UserAuthInterface = {
			username: user.getEmail(),
			clientId: user.getId(),
		};
		const token = this.cryptographyService.encodeJwt(userAuthToEncode, 'utf8', '1d');

		return { user, token };
	}

	public async listUsers(query: ListQueryInterface): Promise<UserListEntity> {
		const usersList = await this.userService.list(query);
		return usersList;
	}

	public async createUser(data: CreateUserInputDto, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent',
			});

		const newUser = new UserEntity(data);
		const existentUser = await this.userService.getByEmail(newUser.getEmail());
		if (existentUser)
			throw this.exceptions.conflict({
				message: this.httpConstants.messages.conflict('User'),
			});

		const createdUser = await this.userService.create(newUser);

		const newPreference = new UserPreferenceEntity(data.preference);
		newPreference.setUserId(createdUser.getId());
		await this.userPreferenceService.create(newPreference);

		const foundedUser = await this.userService.getById(createdUser.getId(), true);
		const foundedPreference = await this.userPreferenceService.getByUserId(createdUser.getId());
		if (foundedPreference)
			foundedUser?.setPreference(foundedPreference);

		return foundedUser;
	}

	public async getUser(id: string, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent',
			});

		const foundedUser = await this.userService.getById(id, true);
		const foundedPreference = await this.userPreferenceService.getByUserId(id);

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);
		foundedUser.setPassword('');

		return foundedUser;
	}

	public async updateUser(id: string, data: UpdateUserInputDto, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent',
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		const isAllowedToUpdateUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to update this user!',
			});

		const mustUpdateUser = this.mustUpdate(user.getAttributes(), data);
		const mustUpdateUserPreference = this.mustUpdate(preference.getAttributes(), data.preference);
		if (mustUpdateUser)
			await this.userService.update(user.getId(), data);
		if (data.preference !== undefined && mustUpdateUserPreference)
			await this.userPreferenceService.update(preference.getId(), data.preference);

		const foundedUser = await this.userService.getById(user.getId(), true);
		const foundedPreference = await this.userPreferenceService.getByUserId(user.getId());

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	public async deleteUser(id: string, userAgent?: UserAuthInterface): Promise<boolean> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent',
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		const isAllowedToDeleteUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToDeleteUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to delete this user!',
			});

		await this.userPreferenceService.delete(preference.getId(), {
			softDelete: true,
		});
		const softDeletedUser = await this.userService.delete(user.getId(), {
			softDelete: true,
			userAgentId: userAgent.clientId,
		});

		return softDeletedUser;
	}

	private mustUpdate(entityAttributes: any, inputAttributes: any): boolean {
		if (!entityAttributes || !inputAttributes)
			return false;
		const attributesToUpdate = Object.keys(inputAttributes as any);

		let mustUpdate = false;
		attributesToUpdate.forEach((attributeKey: string) => {
			const isUpdatedField = inputAttributes[attributeKey] !== undefined;
			let hasValueChanged = false;

			if (isUpdatedField) {
				if (typeof inputAttributes[attributeKey] === 'object' && inputAttributes[attributeKey])
					hasValueChanged = this.mustUpdate(entityAttributes[attributeKey], inputAttributes[attributeKey]);
				else
					hasValueChanged = inputAttributes[attributeKey] !== entityAttributes[attributeKey];
			}

			if (isUpdatedField && hasValueChanged)
				mustUpdate = true;
		});

		return mustUpdate;
	}
}
