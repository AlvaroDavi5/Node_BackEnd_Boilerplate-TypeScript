import { Injectable } from '@nestjs/common';
import UserPreferenceRepository from '@app/user/repositories/userPreference/UserPreference.repository';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import Exceptions from '@core/errors/Exceptions';


@Injectable()
export default class UserPreferenceService {
	constructor(
		private readonly userPreferenceRepository: UserPreferenceRepository,
		private readonly exceptions: Exceptions,
	) { }

	public async getByUserId(userId: string): Promise<UserPreferenceEntity | null> {
		try {
			return await this.userPreferenceRepository.findOne({ where: { user: { id: userId } } });
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async create(entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> {
		try {
			return await this.userPreferenceRepository.create(entity);
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async update(id: string, data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity | null> {
		const { id: preferenceId, userId, createdAt, ...userPreferenceData } = new UserPreferenceEntity(data).getAttributes();

		try {
			return await this.userPreferenceRepository.update(id, userPreferenceData);
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}

	public async delete(id: string, data: { softDelete: boolean }): Promise<boolean | null> {
		try {
			return await this.userPreferenceRepository.deleteOne(id, Boolean(data.softDelete));
		} catch (error) {
			throw this.exceptions.internal({
				message: 'Error to comunicate with database',
				details: `${(error as any)?.original}`,
			});
		}
	}
}
