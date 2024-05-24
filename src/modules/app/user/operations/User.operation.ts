import { Injectable } from '@nestjs/common';
import UserEntity, { UserEntityList } from '@domain/entities/User.entity';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserStrategy from '@app/user/strategies/User.strategy';
import Exceptions from '@core/errors/Exceptions';
import { UserAuthInterface } from '@shared/interfaces/userAuthInterface';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';
import CryptographyService from '@core/security/Cryptography.service';


@Injectable()
export default class UserOperation {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly cryptographyService: CryptographyService,
		private readonly userStrategy: UserStrategy,
		private readonly exceptions: Exceptions,
	) { }

	public async loginUser(data: { email: string, password: string }): Promise<{ user: UserEntity, token: string }> {
		const foundedUser = await this.userService.getByEmail(data.email);
		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'User not found!'
			});

		this.userService.validatePassword(foundedUser, data.password);

		const foundedPreference = await this.userPreferenceService.getByUserId(foundedUser.getId());

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);
		foundedUser.setPassword('');

		const userAuthToEncode: UserAuthInterface = {
			username: foundedUser.getLogin().email,
			clientId: foundedUser.getId().toString(),
		};
		const token = this.cryptographyService.encodeJwt(userAuthToEncode, 'utf8', '1d');

		return { user: foundedUser, token };
	}

	public async listUsers(query: ListQueryInterface): Promise<UserEntityList> {
		const usersList = await this.userService.list(query);
		return usersList;
	}

	public async createUser(data: unknown, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const newUser = new UserEntity(data);
		const createdUser = await this.userService.create(newUser);

		if (!createdUser)
			throw this.exceptions.conflict({
				message: 'User not created!'
			});

		const newPreference = new UserPreferenceEntity(data);
		if (createdUser.getId()) {
			newPreference.setUserId(createdUser.getId());
			await this.userPreferenceService.create(newPreference);
		}

		const foundedUser = await this.userService.getById(createdUser.getId(), true);
		const foundedPreference = await this.userPreferenceService.getByUserId(createdUser.getId());
		if (foundedPreference)
			foundedUser?.setPreference(foundedPreference);

		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'Created user not found!'
			});

		return foundedUser;
	}

	public async getUser(id: string, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const foundedUser = await this.userService.getById(id, true);
		const foundedPreference = await this.userPreferenceService.getByUserId(id);

		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'User not found!'
			});

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	public async updateUser(id: string, data: any, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		if (!user || !preference)
			throw this.exceptions.notFound({
				message: 'User or preference not found!'
			});

		const isAllowedToUpdateUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to update this user!'
			});

		const attributesToUpdate = Object.keys({
			...user.getAttributes(),
			...preference.getAttributes(),
		});
		attributesToUpdate.forEach((attributeKey) => {
			if (attributeKey !== 'id') {
				const userAttribute = (user as any)[attributeKey];
				const preferenceAttribute = (preference as any)[attributeKey];
				const currentAttribute = data[attributeKey];
				data[attributeKey] = currentAttribute ?? userAttribute ?? preferenceAttribute;
			}
		});

		const updatedUser = await this.userService.update(user.getId(), new UserEntity(data));
		const updatedPreference = await this.userPreferenceService.update(preference.getId(), new UserPreferenceEntity(data));

		if (!updatedUser || !updatedPreference)
			throw this.exceptions.conflict({
				message: 'User or preference not updated!'
			});

		const foundedUser = await this.userService.getById(user.getId(), true);
		const foundedPreference = await this.userPreferenceService.getByUserId(user.getId());

		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'User not found!'
			});

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	public async deleteUser(id: string, userAgent?: UserAuthInterface): Promise<boolean> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		if (!user || !preference)
			throw this.exceptions.notFound({
				message: 'User or preference not found!'
			});

		const isAllowedToDeleteUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToDeleteUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to delete this user!'
			});

		await this.userPreferenceService.delete(preference.getId(), {
			softDelete: true,
		});
		const softDeletedUser = await this.userService.delete(user.getId(), {
			softDelete: true,
			userAgentId: userAgent.clientId,
		});

		if (typeof softDeletedUser !== 'boolean')
			throw this.exceptions.conflict({
				message: 'User not deleted!'
			});

		return softDeletedUser;
	}
}
