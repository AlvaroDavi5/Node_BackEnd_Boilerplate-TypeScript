import { Injectable } from '@nestjs/common';
import UserRepository from '@modules/boilerplate/infra/repositories/user/UserRepository';
import UserEntity, { UserInterface } from '@modules/boilerplate/domain/entities/User';


@Injectable()
export default class UserService {
	constructor(
		private readonly userRepository: UserRepository,
	) { }

	async getById(id: number): Promise<UserEntity | null | undefined> {
		try {
			const result = await this.userRepository.getById(id);
			return result;
		} catch (error) {
			return null;
		}
	}

	async create(entity: UserEntity): Promise<UserEntity | null | undefined> {
		try {
			const result = await this.userRepository.create(entity);
			return result;
		} catch (error) {
			return null;
		}
	}

	async update(id: number, data: UserInterface): Promise<UserEntity | null | undefined> {
		try {
			const result = await this.userRepository.update(id, data);
			return result;
		} catch (error) {
			return null;
		}
	}

	async delete(id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<[affectedCount: number] | null | undefined> {
		try {
			const result = await this.userRepository.deleteOne(id, Boolean(data.softDelete), String(data.userAgentId));
			return result;
		} catch (error) {
			return null;
		}
	}

	async list(
		data: {
			size?: number,
			page?: number,
			limit?: number,
			order?: 'ASC' | 'DESC',
			sort?: 'createdAt' | 'updatedAt' | 'deletedAt',
			selectSoftDeleted?: boolean,
			searchTerm?: string,
		}): Promise<{
			content: any[],
			pageNumber: number,
			pageSize: number,
			totalPages: number,
			totalItems: number,
		}> {
		try {
			const result = await this.userRepository.list(data);
			return result;
		} catch (error) {
			return {
				content: [],
				pageNumber: 0,
				pageSize: 0,
				totalPages: 0,
				totalItems: 0,
			};
		}
	}
}
