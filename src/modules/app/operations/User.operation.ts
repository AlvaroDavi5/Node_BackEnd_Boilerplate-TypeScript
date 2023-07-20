import { Injectable } from '@nestjs/common';
import UserEntity from '@modules/app/domain/entities/User.entity';
import UserPreferenceEntity from '@modules/app/domain/entities/UserPreference.entity';
import UserService from '@modules/app/services/User.service';
import UserPreferenceService from '@modules/app/services/UserPreference.service';
import UserStrategy from '@modules/app/strategies/User.strategy';
import Exceptions from '@infra/errors/Exceptions';
import { userAuthType } from 'src/types/_userAuthInterface';


@Injectable()
export default class UserOperation {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly userStrategy: UserStrategy,
		private readonly exceptions: Exceptions,
	) { }

	public async listUsers(data: any): Promise<{
		content: any[];
		pageNumber: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	}> {
		const usersList = await this.userService.list(data);
		return usersList;
	}

	public async createUser(data: any, userAgent?: userAuthType): Promise<UserEntity | null | undefined> {
		if (!userAgent?.username)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const newUser = new UserEntity(data);
		const createdUser = await this.userService.create(newUser);

		const newPreference = new UserPreferenceEntity(data);
		if (createdUser?.getId()) {
			newPreference.setUserId(createdUser.getId());
			await this.userPreferenceService.create(newPreference);
		}

		const result = await this.userService.getById(createdUser?.getId() || 0);
		return result;
	}

	public async getUser(id: number, userAgent?: userAuthType): Promise<UserEntity | null | undefined> {
		if (!userAgent?.username)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const foundedUser = await this.userService.getById(id);
		const foundedPreference = await this.userPreferenceService.getByUserId(id);

		if (!foundedUser)
			throw this.exceptions.conflict({
				message: 'User not found!'
			});

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	public async updateUser(id: number, data: any, userAgent?: userAuthType): Promise<UserEntity | null | undefined> {
		if (!userAgent?.username)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user = await this.userService.getById(id);
		const preference = await this.userPreferenceService.getByUserId(id);

		if (!user || !preference)
			throw this.exceptions.contract({
				message: 'User or preference not found!'
			});

		const isAllowedToUpdateUser = this.userStrategy.manageAuth(user, userAgent);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.unauthorized({
				message: 'userAgent not allowed to execute this action'
			});

		const updatedPreference = await this.userPreferenceService.update(preference.getId(), data);
		const updatedUser = await this.userService.update(user.getId(), data);
		if (updatedPreference)
			updatedUser?.setPreference(updatedPreference);

		return updatedUser;
	}

	public async deleteUser(id: number, userAgent?: userAuthType): Promise<[affectedCount: number] | null | undefined> {
		if (!userAgent?.username)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user = await this.userService.getById(id);
		const preference = await this.userPreferenceService.getByUserId(id);

		if (!user || !preference)
			throw this.exceptions.conflict({
				message: 'User or preference not found!'
			});

		await this.userPreferenceService.delete(preference.getId(), {
			softDelete: true,
		});
		const updatedUser = await this.userService.delete(user.getId(), {
			softDelete: true,
			userAgentId: userAgent.username,
		});

		return updatedUser;
	}
}
