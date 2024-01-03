import { Injectable } from '@nestjs/common';
import UserEntity from '@app/domain/entities/User.entity';
import UserPreferenceEntity from '@app/domain/entities/UserPreference.entity';
import UserService from '@app/services/User.service';
import UserPreferenceService from '@app/services/UserPreference.service';
import UserStrategy from '@app/strategies/User.strategy';
import Exceptions from '@core/infra/errors/Exceptions';
import { UserAuthInterface } from 'src/types/userAuthInterface';
import { ListQueryInterface, PaginationInterface } from 'src/types/listPaginationInterface';


@Injectable()
export default class UserOperation {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly userStrategy: UserStrategy,
		private readonly exceptions: Exceptions,
	) { }

	public async loginUser(data: { email: string, password: string }, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

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
		return foundedUser;
	}

	public async listUsers(query: ListQueryInterface): Promise<PaginationInterface<UserEntity>> {
		const usersList = await this.userService.list(query);

		if (!usersList)
			throw this.exceptions.integration({
				message: 'Error to connect database',
			});

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

		const foundedUser = await this.userService.getById(createdUser.getId());
		const foundedPreference = await this.userPreferenceService.getByUserId(createdUser.getId());
		if (foundedPreference)
			foundedUser?.setPreference(foundedPreference);

		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'Created user not found!'
			});

		return foundedUser;
	}

	public async getUser(id: number, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const foundedUser = await this.userService.getById(id);
		const foundedPreference = await this.userPreferenceService.getByUserId(id);

		if (!foundedUser)
			throw this.exceptions.notFound({
				message: 'User not found!'
			});

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	public async updateUser(id: number, data: unknown, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user = await this.userService.getById(id);
		const preference = await this.userPreferenceService.getByUserId(id);

		if (!user || !preference)
			throw this.exceptions.notFound({
				message: 'User or preference not found!'
			});

		const isAllowedToUpdateUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to update this user'
			});

		const updatedPreference = await this.userPreferenceService.update(preference.getId(), new UserPreferenceEntity(data));
		const updatedUser = await this.userService.update(user.getId(), new UserEntity(data));

		if (!updatedUser)
			throw this.exceptions.conflict({
				message: 'User not updated!'
			});

		if (updatedPreference)
			updatedUser.setPreference(updatedPreference);

		return updatedUser;
	}

	public async deleteUser(id: number, userAgent?: UserAuthInterface): Promise<boolean> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user = await this.userService.getById(id);
		const preference = await this.userPreferenceService.getByUserId(id);

		if (!user || !preference)
			throw this.exceptions.notFound({
				message: 'User or preference not found!'
			});

		const isAllowedToDeleteUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToDeleteUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to delete this user'
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
