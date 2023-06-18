import { Injectable } from '@nestjs/common';
import UserPreferenceRepository from '@modules/boilerplate/infra/repositories/userPreference/UserPreferenceRepository';
import UserPreferenceEntity, { UserPreferenceInterface } from '@modules/boilerplate/domain/entities/UserPreference';


@Injectable()
export default class UserPreferenceService {
	constructor(
		private readonly userPreferenceRepository: UserPreferenceRepository,
	) { }

	async getByUserId(userId: number): Promise<UserPreferenceEntity | null> {
		try {
			const result = await this.userPreferenceRepository.findOne({ userId: userId });
			return result;
		} catch (error) {
			return null;
		}
	}

	async create(data: UserPreferenceEntity): Promise<UserPreferenceEntity | null> {
		try {
			const result = await this.userPreferenceRepository.create(data);
			return result;
		} catch (error) {
			return null;
		}
	}

	async update(id: number, data: UserPreferenceInterface): Promise<UserPreferenceEntity | null> {
		try {
			const result = await this.userPreferenceRepository.update(id, data);
			return result;
		} catch (error) {
			return null;
		}
	}

	async delete(id: number, data: { softDelete: boolean }): Promise<[affectedCount: number] | null | undefined> {
		try {
			const result = await this.userPreferenceRepository.deleteOne(id, Boolean(data.softDelete));
			return result;
		} catch (error) {
			return null;
		}
	}
}
