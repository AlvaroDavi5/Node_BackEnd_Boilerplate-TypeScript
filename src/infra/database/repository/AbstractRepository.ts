import { Model, Op, QueryTypes } from 'sequelize';
import { Logger } from 'winston';
import Entity from '@infra/database/entities/Entity';
import Exceptions from '@infra/errors/exceptions';


class _RepositoryModel extends Model {
	static associate() {
		this.hasOne(
			_RepositoryModel,
			{}
		);
	}
}

export default abstract class AbstractRepository {
	public DomainEntity: typeof Entity;
	public ResourceModel: typeof _RepositoryModel;
	public resourceMapper: {
		toDatabase: (data: any) => any,
		toEntity: (data: any) => any,
	};

	public queryParamsBuilder: {
		buildParams: (data: any) => any,
	};

	public queryOptions: any;
	public exceptions: Exceptions;
	public logger: Logger;

	constructor({
		DomainEntity,
		ResourceModel,
		resourceMapper,
		queryParamsBuilder,
		queryOptions,
		exceptions,
		logger,
	}: any) {
		this.DomainEntity = DomainEntity;
		this.ResourceModel = ResourceModel;
		this.resourceMapper = resourceMapper;
		this.queryParamsBuilder = queryParamsBuilder;
		this.queryOptions = queryOptions;
		this.exceptions = exceptions;
		this.logger = logger;

		this.ResourceModel?.associate();
	}

	validatePayload(entity: any) {
		if (!(entity instanceof this.DomainEntity)) {
			throw this.exceptions.contract({
				message: 'ValidationError',
				details: 'Invalid object',
			});
		}

		const { valid, error } = entity.validate();

		if (!valid) {
			throw this.exceptions.contract({
				message: 'ValidationError',
				details: error?.message,
				stack: error?.stack,
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

		const totalPages = Math.ceil(count / parseInt(query?.size)) || 1;
		const pageNumber = parseInt(query?.page) || 0;
		const pageSize = parseInt(query?.limit) || count;

		let content: any[] = [];
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
		const where = {
			id: Number(id),
		};

		let result = null;
		if (softDelete) {
			const timestamp = new Date();
			result = await this.ResourceModel.update({
				deletedAt: timestamp,
				deletedBy: agentId,
			}, { where });
		}
		else {
			const register = await this.ResourceModel.findByPk(id);
			result = await register?.destroy();
		}
		if (!result) return;

		return result;
	}

	async deleteMany(ids: Array<number>, softDelete = true, agentId: number | string | null = null) {
		const where: any = {};
		where.id = { [Op.in]: ids };

		let result = null;
		if (softDelete) {
			const timestamp = new Date();
			result = await this.ResourceModel.update(
				{
					deletedAt: timestamp,
					deletedBy: agentId,
				},
				{
					where,
				}
			);
		}
		else {
			const registers = await this.ResourceModel.findAll({
				where,
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
