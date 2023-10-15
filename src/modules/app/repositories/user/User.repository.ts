import { Injectable } from '@nestjs/common';
import { Association } from 'sequelize';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import Exceptions from '@infra/errors/Exceptions';
import AbstractRepository from '@infra/database/repositories/AbstractRepository.repository';
import UsersModel, { userAttributes, userOptions } from '@infra/database/models/Users.model';
import UserEntity from '@modules/app/domain/entities/User.entity';
import userMapper from './user.mapper';
import { userQueryParamsBuilder, userQueryOptions } from './user.query';
import UserPreferencesModel from '@infra/database/models/UserPreferences.model';


@Injectable()
export default class UserRepository extends AbstractRepository<UsersModel, UserEntity> {
	public static associations: {
		preference: Association<UserPreferencesModel>,
	};

	constructor(
		exceptions: Exceptions,
		loggerGenerator: LoggerGenerator,
	) {
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

	public associate() {
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

	public async list(query?: any, restrictData = true): Promise<{
		content: UserEntity[],
		pageNumber: number,
		pageSize: number,
		totalPages: number,
		totalItems: number,
	}> {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutSensibleData') : this.ResourceModel;
		const buildedQuery = this.queryParamsBuilder?.buildParams(query);

		const { rows, count } = await userModel.findAndCountAll(buildedQuery);

		const totalPages = Math.ceil(count / parseInt(query?.size)) || 1;
		const pageNumber = parseInt(query?.page) || 0;
		const pageSize = parseInt(query?.limit) || count;

		let content: UserEntity[] = [];
		if (count > 0) {
			content = rows.map((item) =>
				this.resourceMapper.toEntity(item)
			);
		}

		const list = {
			content,
			pageNumber,
			pageSize,
			totalPages,
			totalItems: count,
		};

		return list;
	}
}
