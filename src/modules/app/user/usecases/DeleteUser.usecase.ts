import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserStrategy from '@app/user/strategies/User.strategy';
import UserEntity from '@domain/entities/User.entity';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class DeleteUserUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly userStrategy: UserStrategy,
		private readonly exceptions: Exceptions,
	) { }

	public async execute(id: string, agentUser?: UserAuthInterface): Promise<void> {
		if (!agentUser?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid agentUser',
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		this.validatePermissionToDeleteUser(agentUser, user);

		await this.userPreferenceService.delete(preference.getId(), {
			softDelete: true,
		});
		const softDeletedUser = await this.userService.delete(user.getId(), {
			softDelete: true,
			agentUserId: agentUser.clientId,
		});

		if (!softDeletedUser) {
			throw this.exceptions.internal({
				message: 'User not deleted',
			});
		}
	}

	private validatePermissionToDeleteUser(agentUser: UserAuthInterface, user: UserEntity): void {
		const isAllowedToDeleteUser = this.userStrategy.isAllowedToManageUser(agentUser, user);
		if (!isAllowedToDeleteUser)
			throw this.exceptions.business({
				message: 'agentUser not allowed to delete this user!',
			});
	}
}
