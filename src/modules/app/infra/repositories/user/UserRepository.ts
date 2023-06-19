import { Injectable } from '@nestjs/common';
import LoggerGenerator from '@infra/logging/logger';
import Exceptions from '@infra/errors/exceptions';
import AbstractRepository from '@infra/database/repositories/AbstractRepository';
import UsersModel from '@infra/database/models/Users';
import UserEntity from '@modules/app/domain/entities/User';
import userMapper from './userMapper';
import { userQueryParamsBuilder, userQueryOptions } from './userQuery';


@Injectable()
export default class UserRepository extends AbstractRepository {
	constructor(
		exceptions: Exceptions,
		logger: LoggerGenerator,
	) {
		super({
			DomainEntity: UserEntity,
			ResourceModel: UsersModel,
			resourceMapper: userMapper,
			queryParamsBuilder: userQueryParamsBuilder,
			queryOptions: userQueryOptions,
			exceptions: exceptions,
			logger: logger,
		});
	}

	async getById(id: number, restrictData = true) {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutPassword') : this.ResourceModel;

		const result = await userModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	async list(query?: any, restrictData = true) {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutSensibleData') : this.ResourceModel;
		const buildedQuery = this.queryParamsBuilder?.buildParams(query);

		const { rows, count } = await userModel.findAndCountAll(buildedQuery);

		const totalPages = Math.ceil(count / parseInt(query?.size)) || 1;
		const pageNumber = parseInt(query?.page) || 0;
		const pageSize = parseInt(query?.limit) || count;

		let content: any[] = [];
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
