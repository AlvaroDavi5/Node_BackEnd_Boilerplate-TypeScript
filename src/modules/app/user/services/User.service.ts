import { Injectable } from '@nestjs/common';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import UserEntity, { IUpdateUser } from '@domain/entities/User.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import UserRepository from '@app/user/repositories/user/User.repository';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';


@Injectable()
export default class UserService {
	constructor(
		private readonly cryptographyService: CryptographyService,
		private readonly userRepository: UserRepository,
		private readonly exceptions: Exceptions,
	) { }

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

			const foundedUser = await this.getByEmail(entity.getEmail());
			if (foundedUser)
				throw this.exceptions.conflict({
					message: 'E-mail already in use!',
				});
			const createdUser = await this.userRepository.create(entity);

			createdUser.setPassword('');
			return createdUser;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async update(id: string, data: IUpdateUser): Promise<UserEntity> {
		const { preference: _, ...payload } = data;
		const {
			id: _id, preference: _preference,
			createdAt: _createdAt, updatedAt: _updatedAt, deletedAt: _deletedAt,
			...userData
		} = new UserEntity(payload).getAttributes();

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

	public validatePassword(userPassword: string, passwordToValidate: string): void {
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

		const newHash = this.hashPassword(passwordToValidate, salt);

		const isSameHash = this.cryptographyService.compareBuffer(Buffer.from(hash), Buffer.from(newHash ?? ''));
		if (!isSameHash)
			throw this.exceptions.unauthorized({
				message: 'Incorrect password',
				details: 'Password hash is different from database',
			});
	}

	/**
		@description Generates a protected password by hashing the plain text password with a secret and a salt.
		@param plainTextPassword - The plain text password to be protected.
		@returns salt | hash(plainTextPassword + secretEnv + salt)
	**/
	private protectPassword(plainTextPassword: string): string {
		const salt = this.cryptographyService.generateSalt();
		if (!salt)
			throw this.exceptions.internal({
				message: 'Error to generate salt',
			});

		const hash = this.hashPassword(plainTextPassword, salt);
		if (!hash)
			throw this.exceptions.internal({
				message: 'Error to generate hash',
			});

		const result = `${salt}|${hash}`;

		return result;
	}

	private hashPassword(plainTextPassword: string, salt: string): string | null {
		return this.cryptographyService.hashWithSecret('sha256', 'utf8', 'base64url', plainTextPassword, salt);
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
