import { Injectable, Inject } from '@nestjs/common';
import { Sequelize, Association } from 'sequelize';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import Exceptions from '@core/infra/errors/Exceptions';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import AbstractRepository from '@core/infra/database/repositories/AbstractRepository.repository';
import UsersModel, { userAttributes, userOptions } from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import UserEntity from '@app/domain/entities/User.entity';
import userMapper from './user.mapper';
import { userQueryParamsBuilder, userQueryOptions } from './user.query';
import { ListQueryInterface, PaginationInterface } from 'src/types/_listPaginationInterface';


@Injectable()
export default class UserRepository extends AbstractRepository<UsersModel, UserEntity> {
	public static associations: {
		preference: Association<UserPreferencesModel>,
	};

	constructor(
		@Inject(DATABASE_CONNECTION_PROVIDER)
			connection: Sequelize,
			exceptions: Exceptions,
			loggerGenerator: LoggerGenerator,
	) {
		userOptions.sequelize = connection;
		super({
			DomainEntity: UserEntity,
			ResourceModel: UsersModel,
			resourceAttributes: userAttributes,
			resourceOptions: userOptions,
			resourceMapper: userMapper,
			queryParamsBuilder: userQueryParamsBuilder,
			queryOptions: userQueryOptions,
			exceptions: exceptions,
			loggerGenerator: loggerGenerator,
		});
	}

	public associate(): void {
		this.ResourceModel.hasOne(
			UserPreferencesModel,
			{
				constraints: true,
				foreignKeyConstraint: true,
				foreignKey: 'userId',
				sourceKey: 'id',
				as: 'preference',
			}
		);
	}

	public async getById(id: number, restrictData = true): Promise<UserEntity | null> {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutPassword') : this.ResourceModel;

		const result = await userModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async list(query?: ListQueryInterface, restrictData = true): Promise<PaginationInterface<UserEntity>> {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutSensibleData') : this.ResourceModel;

		const buildedQuery = this.queryParamsBuilder?.buildParams(query);
		const { rows, count } = await userModel.findAndCountAll(buildedQuery);

		const totalItems = count;
		const totalPages = Math.ceil(totalItems / (query?.limit ?? 1)) || 1;
		const pageNumber = query?.page ?? 0;
		const pageSize = rows.length;

		let content: UserEntity[] = [];
		if (rows.length) {
			content = rows.map((register) =>
				this.resourceMapper.toEntity(register)
			);
		}

		return {
			content,
			pageNumber,
			pageSize,
			totalPages,
			totalItems,
		};
	}
}
