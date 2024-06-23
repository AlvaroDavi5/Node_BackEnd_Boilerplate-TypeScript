import { Injectable } from '@nestjs/common';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import UserEntity from '@domain/entities/User.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class LoginUserUseCase {
	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
	) { }

	public async execute(data: { email: string, password: string }): Promise<{ user: UserEntity, token: string }> {
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
}
