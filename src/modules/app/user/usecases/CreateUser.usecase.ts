import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserEntity from '@domain/entities/User.entity';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import HttpMessagesConstants from '@common/constants/HttpMessages.constants';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';
import CreateUserInputDto from '../api/dto/user/CreateUserInput.dto';


@Injectable()
export default class CreateUserUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly httpMessagesConstants: HttpMessagesConstants,
		private readonly exceptions: Exceptions,
	) { }

	public async execute(data: CreateUserInputDto, agentUser?: UserAuthInterface): Promise<UserEntity> {
		if (!agentUser?.clientId)
			throw this.exceptions.unauthorized({
				message: 'Invalid agentUser',
			});

		const newUser = new UserEntity(data);
		const existentUser = await this.userService.getByEmail(newUser.getEmail());
		if (!!existentUser)
			throw this.exceptions.conflict({
				message: this.httpMessagesConstants.messages.conflict('User'),
			});

		const createdUser = await this.userService.create(newUser);

		const newPreference = new UserPreferenceEntity(data.preference);
		newPreference.setUserId(createdUser.getId());
		await this.userPreferenceService.create(newPreference);

		const [foundedUser, foundedPreference] = await Promise.all([
			this.userService.getById(createdUser.getId(), true),
			this.userPreferenceService.getByUserId(createdUser.getId()),
		]);

		if (foundedPreference)
			foundedUser?.setPreference(foundedPreference);

		return foundedUser;
	}
}
