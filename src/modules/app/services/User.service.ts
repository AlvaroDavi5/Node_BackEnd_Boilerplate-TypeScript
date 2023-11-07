import { Injectable } from '@nestjs/common';
import UserEntity from '@app/domain/entities/User.entity';
import UserRepository from '@app/repositories/user/User.repository';
import { ListQueryInterface, PaginationInterface } from 'src/types/_listPaginationInterface';


@Injectable()
export default class UserService {
	constructor(
		private readonly userRepository: UserRepository,
	) { }

	public async getById(id: number): Promise<UserEntity | null> {
		try {
			const result = await this.userRepository.getById(id);
			return result;
		} catch (error) {
			return null;
		}
	}

	public async create(entity: UserEntity): Promise<UserEntity | null> {
		try {
			const result = await this.userRepository.create(entity);
			return result;
		} catch (error) {
			return null;
		}
	}

	public async update(id: number, entity: UserEntity): Promise<UserEntity | null> {
		try {
			const result = await this.userRepository.update(id, entity);
			return result;
		} catch (error) {
			return null;
		}
	}

	public async delete(id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> {
		try {
			const result = await this.userRepository.deleteOne(id, Boolean(data.softDelete), String(data.userAgentId));
			return result;
		} catch (error) {
			return null;
		}
	}

	public async list(query: ListQueryInterface): Promise<PaginationInterface<UserEntity>> {
		try {
			const result = await this.userRepository.list(query);
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
