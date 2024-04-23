import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import UserEntity, { UserEntityList } from '@domain/entities/User.entity';
import CryptographyService from '@core/infra/security/Cryptography.service';
import UserRepository from '@app/user/repositories/user/User.repository';
import Exceptions from '@core/infra/errors/Exceptions';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';
import { ConfigsInterface } from '@core/configs/configs.config';


@Injectable()
export default class UserService {
	private readonly secret: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly userRepository: UserRepository,
		private readonly exceptions: Exceptions,
	) {
		const { secretKey } = this.configService.get<ConfigsInterface['security']>('security')!;
		this.secret = secretKey;
	}

	public async getById(id: number, withoutPassword = true): Promise<UserEntity | null> {
		try {
			return await this.userRepository.getById(id, withoutPassword);
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async getByEmail(email: string): Promise<UserEntity | null> {
		try {
			return await this.userRepository.findOne({ email: email });
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async create(entity: UserEntity): Promise<UserEntity | null> {
		try {
			const userPassword = entity.getPassword();
			if (!userPassword?.length)
				throw this.exceptions.business({
					message: 'Invalid password',
				});

			entity.setPassword(this.protectPassword(userPassword));

			return await this.userRepository.create(entity);
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async update(id: number, entity: UserEntity): Promise<UserEntity | null> {
		try {
			const userPassword = entity.getPassword();
			if (userPassword?.length)
				entity.setPassword(this.protectPassword(userPassword));

			return await this.userRepository.update(id, entity);
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async delete(id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> {
		try {
			return await this.userRepository.deleteOne(id, Boolean(data.softDelete), String(data.userAgentId));
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async list(query: ListQueryInterface): Promise<UserEntityList> {
		try {
			return await this.userRepository.list(query);
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	// * dbRes = salt + hash(salt + password + secretEnv)
	private protectPassword(plainTextPassword: string): string {
		const salt = this.cryptographyService.generateSalt();
		if (!salt)
			throw this.exceptions.internal({
				message: 'Error to generate salt',
			});

		const toHash = salt + plainTextPassword + this.secret;
		const hash = this.cryptographyService.hashing(toHash, 'ascii', 'sha256', 'base64url');
		if (!hash)
			throw this.exceptions.internal({
				message: 'Error to generate hash',
			});

		const result = `${salt}|${hash}`;

		return result;
	}

	public validatePassword(entity: UserEntity, passwordToValidate: string): void {
		const userPassword = entity.getPassword();
		if (!userPassword?.length)
			throw this.exceptions.unauthorized({
				message: 'Invalid password',
			});

		const splittedUserPassword = userPassword.split('|');
		const salt = splittedUserPassword[0];
		const hash = splittedUserPassword[1];

		if (!salt.length || !hash.length)
			throw this.exceptions.internal({
				message: 'Invalid salt or hash from database',
			});

		const toHash = salt + passwordToValidate + this.secret;
		const newHash = this.cryptographyService.hashing(toHash, 'ascii', 'sha256', 'base64url');
		if (newHash !== hash)
			throw this.exceptions.unauthorized({
				message: 'Password hash is different from database',
			});
	}
}
