import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserEntity from '@domain/entities/User.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserStrategy from '@app/user/strategies/User.strategy';
import UpdateUserInputDto from '../api/dto/user/UpdateUserInput.dto';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';
import { getObjKeys } from '@common/utils/dataValidations.util';


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

		const mustUpdateUser = this.mustUpdate(user.getAttributes(), data);
		const mustUpdateUserPreference = this.mustUpdate(preference.getAttributes(), data.preference);
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

	private mustUpdate<EA = any, IA = any>(entityAttributes: EA, inputAttributes: IA): boolean {
		if (!entityAttributes || !inputAttributes)
			return false;
		const attributesToUpdate = getObjKeys<IA>(inputAttributes);

		let mustUpdate = false;
		attributesToUpdate.forEach((attributeKey) => {
			const isUpdatedField = inputAttributes[attributeKey] !== undefined;
			let hasValueChanged = false;

			if (isUpdatedField) {
				if (typeof inputAttributes[attributeKey] === 'object' && inputAttributes[attributeKey])
					hasValueChanged = this.mustUpdate(entityAttributes[attributeKey as unknown as keyof EA], inputAttributes[attributeKey]);
				else
					hasValueChanged = inputAttributes[attributeKey] !== (entityAttributes as any)[attributeKey];
			}

			if (isUpdatedField && hasValueChanged)
				mustUpdate = true;
		});

		return mustUpdate;
	}

	private validatePermissionToUpdateUser(userAgent: UserAuthInterface, user: UserEntity): void {
		const isAllowedToUpdateUser = this.userStrategy.isAllowedToManageUser(userAgent, user);
		if (!isAllowedToUpdateUser)
			throw this.exceptions.business({
				message: 'userAgent not allowed to update this user!',
			});
	}
}
