import { Injectable, Inject } from '@nestjs/common';
import { DataSource, In, FindOneOptions, FindManyOptions, UpdateResult } from 'typeorm';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import AbstractRepository from '@core/infra/database/repositories/AbstractRepository.repository';
import UsersModel from '@core/infra/database/models/Users.model';
import UserEntity from '@domain/entities/User.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import userMapper from './user.mapper';
import { userQueryParamsBuilder, UserBuildParamsInterface } from './user.query';


@Injectable()
export default class UserRepository extends AbstractRepository<UsersModel, UserEntity, UserBuildParamsInterface> {
	constructor(
		@Inject(DATABASE_CONNECTION_PROVIDER) connection: DataSource,
			exceptions: Exceptions,
			logger: LoggerService,
	) {
		logger.setContextName(UserRepository.name);
		super({
			connection,
			DomainEntity: UserEntity,
			ResourceModel: UsersModel,
			ResourceRepo: UsersModel.getRepository(),
			resourceMapper: userMapper,
			queryParamsBuilder: userQueryParamsBuilder,
			exceptions,
			logger,
		});
	}

	public async getById(id: string, withoutPassword = true): Promise<UserEntity | null> {
		try {
			const buildedQuery = this.queryParamsBuilder.buildParams({
				id,
				withoutSensitiveData: false,
				withoutPassword,
			});
			const result = await this.ResourceRepo.findOne(buildedQuery);
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async list(query?: ListQueryInterface, withoutSensitiveData = true): Promise<PaginationInterface<UserEntity>> {
		try {
			const buildedQuery = this.queryParamsBuilder.buildParams({
				...(query ?? {}),
				withoutSensitiveData,
				withoutPassword: true,
			});
			const { 0: rows, 1: count } = await this.ResourceRepo.findAndCount(buildedQuery);

			const totalItems = count;
			const totalPages = Math.ceil(totalItems / (query?.limit ?? 1)) || 1;
			const pageNumber = query?.page ?? 0;
			const pageSize = rows.length;

			let content: UserEntity[] = [];
			if (rows.length) {
				content = rows.map((register) => this.resourceMapper.toDomainEntity(register));
			}

			return {
				content,
				pageNumber,
				pageSize,
				totalPages,
				totalItems,
			};
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteOne(id: string, softDelete = true, agentId: string | null = null): Promise<boolean> {
		try {
			const query: FindOneOptions<UsersModel> = {
				where: { id },
			};

			let result: UpdateResult | UsersModel | null = null;
			if (softDelete) {
				const timestamp = this.getISODateNow();
				result = await this.ResourceRepo.update(id, {
					deletedAt: timestamp,
					deletedBy: agentId,
				});
				if (result !== null && result !== undefined) {
					const res = result.affected
						? result.affected > 0
						: true;
					return res;
				} else
					return false;
			} else {
				const register = await this.ResourceRepo.findOne(query);
				if (register) {
					result = await register.remove();
					return true;
				}
				return false;
			}
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteMany(ids: string[], softDelete = true, agentId: string | null = null): Promise<number> {
		try {
			const query: FindManyOptions<UsersModel> = {
				where: { id: In(ids) }
			};

			let result: UpdateResult | UsersModel | null = null;
			if (softDelete) {
				const timestamp = this.getISODateNow();
				result = await this.ResourceRepo.update(ids, {
					deletedAt: timestamp,
					deletedBy: agentId,
				});
				return Number(result.affected);
			} else {
				const registers = await this.ResourceRepo.find(query);
				if (!registers) return 0;

				let counter = 0;
				for (const register of registers) {
					result = await register.remove();
					counter++;
				}
				return counter;
			}
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}
}
