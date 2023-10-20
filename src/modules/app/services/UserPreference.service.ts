import { Injectable } from '@nestjs/common';
import UserPreferenceRepository from '@app/repositories/userPreference/UserPreference.repository';
import UserPreferenceEntity, { UserPreferenceInterface } from '@app/domain/entities/UserPreference.entity';


@Injectable()
export default class UserPreferenceService {
	constructor(
		private readonly userPreferenceRepository: UserPreferenceRepository,
	) { }

	public async getByUserId(userId: number): Promise<UserPreferenceEntity | null> {
		try {
			const result = await this.userPreferenceRepository.findOne({ userId: userId });
			return result;
		} catch (error) {
			return null;
		}
	}

	public async create(entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> {
		try {
			const result = await this.userPreferenceRepository.create(entity);
			return result;
		} catch (error) {
			return null;
		}
	}

	public async update(id: number, data: UserPreferenceInterface): Promise<UserPreferenceEntity | null> {
		try {
			const result = await this.userPreferenceRepository.update(id, data);
			return result;
		} catch (error) {
			return null;
		}
	}

	public async delete(id: number, data: { softDelete: boolean }): Promise<boolean | null> {
		try {
			const result = await this.userPreferenceRepository.deleteOne(id, Boolean(data.softDelete));
			return result;
		} catch (error) {
			return null;
		}
	}
}
