import { Model, QueryTypes } from 'sequelize';
import { Logger } from 'winston';
import Entity from 'src/domain/entities/Entity';
import { ExceptionInterface } from 'src/infra/errors/exceptions';


class _RepositoryModel extends Model { }

export default abstract class Repository {
	declare DomainEntity: typeof Entity;
	declare ResourceModel: typeof _RepositoryModel;
	declare resourceMapper: {
		toDatabase: (data: any) => any,
		toEntity: (data: any) => any,
	};

	declare queryParamsBuilder: {
		buildParams: (data: any) => any,
	};

	declare queryOptions: any;
	declare exceptions: ExceptionInterface;
	declare logger: Logger;

	constructor({
		DomainEntity,
		ResourceModel,
		resourceMapper,
		queryParamsBuilder,
		QueryOptions,
		exceptions,
		logger,
	}: any) {
		this.DomainEntity = DomainEntity;
		this.ResourceModel = ResourceModel;
		this.resourceMapper = resourceMapper;
		this.queryParamsBuilder = queryParamsBuilder;
		this.queryOptions = QueryOptions;
		this.exceptions = exceptions;
		this.logger = logger;
	}

	validatePayload(entity: any) {
		if (!(entity instanceof this.DomainEntity)) {
			const error = new Error('ValidationError');
			error.message = 'Invalid parameter type';
			throw error;
		}
		const { valid, error } = entity.validate();

		if (!valid) {
			throw this.exceptions.contract({
				errorType: 'ValidationError',
				stack: error,
			});
		}
	}

	async create(data: any) {
		const result = await this.ResourceModel.create(
			this.resourceMapper.toDatabase(data)
		);
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	async getById(id: number) {
		const result = await this.ResourceModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	async findOne(query: any) {
		const result = await this.ResourceModel.findOne({
			where: query,
			...this.queryOptions,
		});
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	async findAll(query?: any) {
		const result = await this.ResourceModel.findAll({
			where: query,
			...this.queryOptions,
		});
		if (!result) return;

		return result.map(this.resourceMapper.toEntity);
	}

	async update(id: number, data: any) {
		const where = {
			id: Number(id),
		};
		await this.ResourceModel.update(data, { where });
		const result = await this.ResourceModel.findByPk(id);
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	async list(query?: any) {
		const buildedQuery = this.queryParamsBuilder?.buildParams(query);
		const { rows, count } = await this.ResourceModel.findAndCountAll(buildedQuery);

		const totalPages = Math.ceil(count / Number(query?.size)) || 1;
		const pageNumber = Number(query?.page) || 0;
		const pageSize = Number(query?.limit) || Number(count);

		let content = [];
		if (count > 0) {
			content = rows.map((item: any) =>
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

	async count(query: any) {
		const resource = await this.ResourceModel.count({
			where: query,
			...this.queryOptions,
		});

		return Number(resource);
	}


	async deleteOne(id: number, softDelete = true, agentId: number | string | null = null) {
		let result = null;

		if (softDelete) {
			const timestamp = new Date();
			result = await this.ResourceModel.update(
				{
					deletedAt: timestamp,
					deletedBy: agentId,
				},
				{
					where: {
						id: id,
					},
				}
			);
		}
		else {
			result = await this.ResourceModel.findOne({
				where: {
					id: Number(id),
				},
			});
			result = await result?.destroy();
		}
		if (!result) return;

		return result;
	}

	async deleteMany(ids: Array<number>, softDelete = true, agentId: number | string | null = null) {
		let result = null;

		if (softDelete) {
			const timestamp = new Date();
			result = await this.ResourceModel.update(
				{
					deletedAt: timestamp,
					deletedBy: agentId,
				},
				{
					where: {
						id: ids,
					},
				}
			);
		}
		else {
			const registers = await this.ResourceModel.findAll({
				where: {
					id: ids,
				}
			});
			if (!registers) return;

			for (const register of registers) {
				result = result && await register.destroy();
			}
		}

		return result;
	}

	async executeQuery(sqlQuery: string, QueryType?: QueryTypes) {
		let result: any;

		try {
			result = await this.ResourceModel.sequelize?.query(sqlQuery, {
				type: QueryType,
			});
		} catch (error) {
			this.logger.error(error);
			result = null;
		}

		return result;
	}
}
