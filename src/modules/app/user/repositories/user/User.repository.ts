import { Injectable, Inject } from '@nestjs/common';
import { DataSource, UpdateResult, DeleteResult } from 'typeorm';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
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
		@Inject(REQUEST_LOGGER_PROVIDER) logger: LoggerService,
		@Inject(Exceptions) exceptions: Exceptions,
	) {
		logger.setContextName(UserRepository.name);
		super({
			connection,
			DomainEntity: UserEntity,
			ResourceModel: UsersModel,
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
			const result = await this.resourceRepository.findOne(buildedQuery);
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async list(query?: ListQueryInterface, withoutSensitiveData = true): Promise<PaginationInterface<UserEntity>> {
		try {
			const buildedQuery = this.queryParamsBuilder.buildParams({
				// eslint-disable-next-line no-extra-parens
				...(query ?? {}),
				withoutSensitiveData,
				withoutPassword: true,
			});
			const { 0: rows, 1: count } = await this.resourceRepository.findAndCount(buildedQuery);

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
			let result: UpdateResult | DeleteResult | null = null;

			await this.resourceRepository.update(id, { deletedBy: agentId ?? null });

			if (softDelete) {
				result = await this.resourceRepository.softDelete(id);
			} else {
				result = await this.resourceRepository.delete(id);
			}

			return !!result?.affected;
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteMany(ids: string[], softDelete = true, agentId: string | null = null): Promise<number> {
		try {
			let result: UpdateResult | DeleteResult | null = null;

			await this.resourceRepository.update(ids, { deletedBy: agentId ?? null });

			if (softDelete) {
				result = await this.resourceRepository.softDelete(ids);
			} else {
				result = await this.resourceRepository.delete(ids);
			}

			return Number(result?.affected ?? 0);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}
}
