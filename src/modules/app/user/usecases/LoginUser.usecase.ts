import { Injectable } from '@nestjs/common';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import UserEntity from '@domain/entities/User.entity';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import { delay } from '@common/utils/promises.util';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class LoginUserUseCase {
	private readonly MIN_DELAY_MS = 150;
	private readonly MAX_DELAY_MS = 300;

	constructor(
		private readonly userService: UserService,
		private readonly userPreferenceService: UserPreferenceService,
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) { }

	public async execute(data: { email: string, password: string }): Promise<{ user: UserEntity, token: string }> {
		const userWithoutPassword = false;

		try {
			const startTime = Date.now();

			const foundedUser = await this.userService.getByEmail(data.email);
			if (!foundedUser) {
				this.logger.error('User not founded by e-mail!');
				const simulatedDelayMs = this.MIN_DELAY_MS + Math.floor(Math.random() * (this.MAX_DELAY_MS - this.MIN_DELAY_MS));
				await delay(simulatedDelayMs);
				throw this.exceptions.notFound({
					message: 'User not founded by e-mail!',
				});
			}

			const user = await this.userService.getById(foundedUser.getId(), userWithoutPassword);

			const elapsedMs = Date.now() - startTime;
			const hasRemainingDelay = elapsedMs < this.MIN_DELAY_MS;
			if (hasRemainingDelay)
				await delay(this.MIN_DELAY_MS - elapsedMs);

			this.userService.validatePassword(user.getPassword(), data.password);
			user.setPassword('');

			const preference = await this.userPreferenceService.getByUserId(foundedUser.getId()).catch(() => null).catch(() => null);
			if (!!preference)
				user.setPreference(preference);

			const userAuthToEncode: UserAuthInterface = {
				clientId: user.getId(),
				username: user.getEmail(),
			};
			const token = this.cryptographyService.encodeJwt(userAuthToEncode, 'utf8', '1D');

			return { user, token };
		} catch (_error) {
			throw this.exceptions.unauthorized({
				message: 'Invalid Credentials',
			});
		}
	}
}
