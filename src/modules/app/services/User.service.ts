import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import UserEntity from '@app/domain/entities/User.entity';
import CryptographyService from '@core/infra/security/Cryptography.service';
import UserRepository from '@app/repositories/user/User.repository';
import Exceptions from '@core/infra/errors/Exceptions';
import { ListQueryInterface, PaginationInterface } from '@shared/interfaces/listPaginationInterface';
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
		const { secretKey }: ConfigsInterface['security'] = this.configService.get<any>('security');
		this.secret = secretKey;
	}

	public async getById(id: number): Promise<UserEntity | null> {
		return await this.userRepository.getById(id);
	}

	public async getByEmail(email: string): Promise<UserEntity | null> {
		return await this.userRepository.findOne({ email: email });
	}

	public async create(entity: UserEntity): Promise<UserEntity | null> {
		const userPassword = entity.getPassword();
		if (!userPassword?.length)
			throw this.exceptions.business({
				message: 'Invalid password',
			});

		entity.setPassword(this.protectPassword(userPassword));

		const result = await this.userRepository.create(entity);
		return result;
	}

	public async update(id: number, entity: UserEntity): Promise<UserEntity | null> {
		return await this.userRepository.update(id, entity);
	}

	public async delete(id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> {
		try {
			return await this.userRepository.deleteOne(id, Boolean(data.softDelete), String(data.userAgentId));
		} catch (error) {
			return null;
		}
	}

	public async list(query: ListQueryInterface): Promise<PaginationInterface<UserEntity> | null> {
		try {
			return await this.userRepository.list(query);
		} catch (error) {
			return null;
		}
	}

	private protectPassword(password: string): string {
		// ? dbRes = salt + hash(salt + password + secretEnv)

		const salt = this.cryptographyService.generateSalt();
		if (!salt)
			throw this.exceptions.internal({
				message: 'Error to generate salt',
			});

		const toHash = salt + password + this.secret;
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
