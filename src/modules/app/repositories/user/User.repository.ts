import { Injectable } from '@nestjs/common';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import Exceptions from '@infra/errors/Exceptions';
import AbstractRepository from '@infra/database/repositories/AbstractRepository.repository';
import UsersModel from '@infra/database/models/Users.model';
import UserEntity from '@modules/app/domain/entities/User.entity';
import userMapper from './user.mapper';
import { userQueryParamsBuilder, userQueryOptions } from './user.query';


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

	public async getById(id: number, restrictData = true): Promise<any> {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutPassword') : this.ResourceModel;

		const result = await userModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	public async list(query?: any, restrictData = true): Promise<{
		content: any[];
		pageNumber: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	}> {
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
