import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserStrategy from '@app/user/strategies/User.strategy';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserEntity, { IUpdateUser, IViewUser } from '@domain/entities/User.entity';
import { IUpdateUserPreference, IViewUserPreference } from '@domain/entities/UserPreference.entity';
import UpdateUserInputDto from '@app/user/api/dto/user/UpdateUserInput.dto';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class UpdateUserUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly userStrategy: UserStrategy,
		private readonly exceptions: Exceptions,
	) { }

	public async execute(id: string, data: UpdateUserInputDto, agentUser?: UserAuthInterface): Promise<UserEntity> {
		if (!agentUser?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid agentUser',
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		this.validatePermissionToUpdateUser(agentUser, user);

		const mustUpdateUser = this.userStrategy.mustUpdate<IViewUser, IUpdateUser>(user.getAttributes(), data);
		const mustUpdateUserPreference = !!data.preference
			&& this.userStrategy.mustUpdate<IViewUserPreference, IUpdateUserPreference>(preference.getAttributes(), data.preference);

		if (mustUpdateUser)
			await this.userService.update(user.getId(), data);
		if (!!data.preference && mustUpdateUserPreference)
			await this.userPreferenceService.update(preference.getId(), data.preference);

		const [foundedUser, foundedPreference] = await Promise.all([
			this.userService.getById(user.getId(), true),
			this.userPreferenceService.getByUserId(user.getId()),
		]);

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	private validatePermissionToUpdateUser(agentUser: UserAuthInterface, user: UserEntity): void {
		const isAllowedToUpdateUser = this.userStrategy.isAllowedToManageUser(agentUser, user);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.business({
				message: 'agentUser not allowed to update this user!',
			});
	}
}
