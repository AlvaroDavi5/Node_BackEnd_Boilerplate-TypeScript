import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import { ConfigsInterface } from '@core/configs/envs.config';
import UserEntity, { IUpdateUser } from '@domain/entities/User.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import UserRepository from '@app/user/repositories/user/User.repository';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';


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

	public async getById(id: string, withoutPassword = true): Promise<UserEntity> {
		try {
			const user = await this.userRepository.getById(id, withoutPassword);

			if (!user)
				throw this.exceptions.notFound({
					message: 'User not founded by ID!',
				});

			return user;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async getByEmail(email: string): Promise<UserEntity | null> {
		try {
			return await this.userRepository.findOne({ where: { email } });
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async create(entity: UserEntity): Promise<UserEntity> {
		try {
			const userPassword = entity.getPassword();
			if (!userPassword?.length)
				throw this.exceptions.business({
					message: 'Invalid password',
				});

			entity.setPassword(this.protectPassword(userPassword));

			const createdUser = await this.userRepository.create(entity);

			createdUser.setPassword('');
			return createdUser;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async update(id: string, data: IUpdateUser): Promise<UserEntity> {
		const { id: _userId, createdAt: _createdAt, preference: _preference, ...userData } = new UserEntity(data).getAttributes();

		try {
			const userPassword = userData.password;
			if (userPassword?.length)
				userData.password = this.protectPassword(userPassword);

			const updatedUser = await this.userRepository.update(id, userData);

			if (!updatedUser)
				throw this.exceptions.conflict({
					message: 'User not updated!',
				});

			updatedUser.setPassword('');
			return updatedUser;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async delete(id: string, data: { softDelete: boolean, agentUserId?: string }): Promise<boolean> {
		try {
			return await this.userRepository.deleteOne(id, Boolean(data.softDelete), String(data.agentUserId));
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async list(query: ListQueryInterface): Promise<UserListEntity> {
		try {
			return await this.userRepository.list(query, true);
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public validatePassword(entity: UserEntity, passwordToValidate: string): void {
		const userPassword = entity.getPassword();
		if (!userPassword?.length)
			throw this.exceptions.unauthorized({
				message: 'Invalid password',
			});

		const [salt, hash] = userPassword.split('|');

		if (!salt?.length || !hash?.length)
			throw this.exceptions.internal({
				message: 'Error to get password',
				details: 'Invalid salt or hash',
			});

		const toHash = salt + passwordToValidate + this.secret;
		const newHash = this.cryptographyService.hashing(toHash, 'ascii', 'sha256', 'base64url');

		if (!this.isSameHash(hash, newHash))
			throw this.exceptions.unauthorized({
				message: 'Incorrect password',
				details: 'Password hash is different from database',
			});
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

	private isSameHash(h1: string | null, h2: string | null): boolean {
		const hash1 = Buffer.from(h1 ?? 'h1');
		const hash2 = Buffer.from(h2 ?? 'h2');
		return this.cryptographyService.compareBuffer(hash1, hash2);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private caughtError(error: any): Error {
		const errorDetails: string | undefined = error?.message ?? error?.cause ?? error?.original;
		return this.exceptions.internal({
			message: 'Error to comunicate with database',
			details: errorDetails !== undefined ? `${errorDetails}` : undefined,
		});
	}
}
