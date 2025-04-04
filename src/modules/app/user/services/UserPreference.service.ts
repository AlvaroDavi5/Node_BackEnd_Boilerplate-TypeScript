import { Injectable } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import UserPreferenceEntity, { IUpdateUserPreference } from '@domain/entities/UserPreference.entity';
import UserPreferenceRepository from '@app/user/repositories/userPreference/UserPreference.repository';


@Injectable()
export default class UserPreferenceService {
	constructor(
		private readonly userPreferenceRepository: UserPreferenceRepository,
		private readonly exceptions: Exceptions,
	) { }

	public async getByUserId(userId: string): Promise<UserPreferenceEntity> {
		try {
			const preference = await this.userPreferenceRepository.findOne({ where: { user: { id: userId } } });

			if (!preference)
				throw this.exceptions.notFound({
					message: 'Preference not founded by userId!',
				});

			return preference;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async create(entity: UserPreferenceEntity): Promise<UserPreferenceEntity> {
		try {
			return await this.userPreferenceRepository.create(entity);
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async update(id: string, data: IUpdateUserPreference): Promise<UserPreferenceEntity> {
		const { id: _preferenceId, userId: _userId, createdAt: _createdAt, ...userPreferenceData } = new UserPreferenceEntity(data).getAttributes();

		try {
			const preference = await this.userPreferenceRepository.update(id, userPreferenceData);

			if (!preference)
				throw this.exceptions.conflict({
					message: 'Preference not updated!',
				});

			return preference;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async delete(id: string, data: { softDelete: boolean }): Promise<boolean> {
		try {
			return await this.userPreferenceRepository.deleteOne(id, Boolean(data.softDelete));
		} catch (error) {
			throw this.caughtError(error);
		}
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
