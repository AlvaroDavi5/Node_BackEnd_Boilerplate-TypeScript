import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserStrategy from '@app/user/strategies/User.strategy';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserEntity, { IUpdateUser, IViewUser } from '@domain/entities/User.entity';
import { IUpdateUserPreference, IViewUserPreference } from '@domain/entities/UserPreference.entity';
import UpdateUserInputDto from '@app/user/api/dto/user/UpdateUserInput.dto';
import { UserPreferenceInputDto } from '@app/user/api/dto/userPreference/UserPreferenceInput.dto';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class UpdateUserUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly userStrategy: UserStrategy,
		private readonly exceptions: Exceptions,
	) { }

	public async execute(id: string, data: UpdateUserInputDto, userAgent?: UserAuthInterface): Promise<UserEntity> {
		if (!userAgent?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid userAgent',
			});

		const user = await this.userService.getById(id, true);
		const preference = await this.userPreferenceService.getByUserId(id);

		this.validatePermissionToUpdateUser(userAgent, user);

		const mustUpdateUser = this.userStrategy.mustUpdate<IViewUser, IUpdateUser>(user.getAttributes(), data);
		const mustUpdateUserPreference = this.userStrategy.mustUpdate<IViewUserPreference, IUpdateUserPreference>(preference.getAttributes(), data.preference as UserPreferenceInputDto);
		if (mustUpdateUser)
			await this.userService.update(user.getId(), data);
		if (data.preference !== undefined && mustUpdateUserPreference)
			await this.userPreferenceService.update(preference.getId(), data.preference);

		const [foundedUser, foundedPreference] = await Promise.all([
			this.userService.getById(user.getId(), true),
			this.userPreferenceService.getByUserId(user.getId()),
		]);

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);

		return foundedUser;
	}

	private validatePermissionToUpdateUser(userAgent: UserAuthInterface, user: UserEntity): void {
		const isAllowedToUpdateUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to update this user!',
			});
	}
}
