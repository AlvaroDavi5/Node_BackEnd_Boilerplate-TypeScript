import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import AbstractRepository from '@core/infra/database/repositories/AbstractRepository.repository';
import UsersModel from '@core/infra/database/models/Users.model';
import UserEntity from '@domain/entities/User.entity';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import userMapper from './user.mapper';
import { userQueryParamsBuilder } from './user.query';
import { ListQueryInterface, PaginationInterface } from '@shared/interfaces/listPaginationInterface';


@Injectable()
export default class UserRepository extends AbstractRepository<UsersModel, UserEntity> {
	constructor(
		@Inject(DATABASE_CONNECTION_PROVIDER)
			connection: DataSource,
			exceptions: Exceptions,
			logger: LoggerService,
			dateGeneratorHelper: DateGeneratorHelper,
	) {
		logger.setContextName(UserRepository.name);
		super({
			connection: connection,
			DomainEntity: UserEntity,
			ResourceModel: UsersModel,
			ResourceRepo: UsersModel.getRepository(),
			resourceMapper: userMapper,
			queryParamsBuilder: userQueryParamsBuilder,
			dateGeneratorHelper: dateGeneratorHelper,
			exceptions: exceptions,
			logger: logger,
		});
	}

	public async getById(id: string, withoutPassword = true): Promise<UserEntity | null> {
		try {
			let result: UsersModel | null = null;

			if (withoutPassword) {
				result = await this.ResourceRepo.findOne({ where: { id } });
			}
			else {
				result = await this.ResourceRepo.createQueryBuilder()
					.addSelect('password')
					.where({ id })
					.getOne();
			}
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async list(query?: ListQueryInterface, withoutSensitiveData = true): Promise<PaginationInterface<UserEntity>> {
		try {
			const buildedQuery = this.queryParamsBuilder.buildParams(query);

			let result!: [UsersModel[], number];
			if (withoutSensitiveData) {
				result = await this.ResourceRepo.findAndCount(buildedQuery);
			}
			else {
				result = await this.ResourceRepo.createQueryBuilder()
					.addSelect('password')
					.addSelect('document')
					.addSelect('phone')
					.where(buildedQuery)
					.getManyAndCount();
			}

			const { 0: rows, 1: count } = result;

			const totalItems = count;
			const totalPages = Math.ceil(totalItems / (query?.limit ?? 1)) || 1;
			const pageNumber = query?.page ?? 0;
			const pageSize = rows.length;

			let content: UserEntity[] = [];
			if (rows.length) {
				content = rows.map((register) =>
					this.resourceMapper.toDomainEntity(register)
				);
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
}
