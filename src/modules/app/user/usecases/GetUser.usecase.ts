import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserEntity from '@domain/entities/User.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class GetUserUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly exceptions: Exceptions,
	) { }

	public async execute(id: string, agentUser?: UserAuthInterface): Promise<UserEntity> {
		if (!agentUser?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid agentUser',
			});

		const [foundedUser, foundedPreference] = await Promise.all([
			this.userService.getById(id, true),
			this.userPreferenceService.getByUserId(id),
		]);

		if (foundedPreference)
			foundedUser.setPreference(foundedPreference);
		foundedUser.setPassword('');

		return foundedUser;
	}
}
