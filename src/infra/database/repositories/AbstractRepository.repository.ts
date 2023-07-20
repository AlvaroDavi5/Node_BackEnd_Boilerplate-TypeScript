import { Model, Op, QueryTypes } from 'sequelize';
import { Logger } from 'winston';
import Entity from '@infra/database/entities/AbstractEntity.entity';
import Exceptions from '@infra/errors/Exceptions';


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

	public validatePayload(entity: any): void {
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

	public async create(data: any): Promise<any> {
		const result = await this.ResourceModel.create(
			this.resourceMapper.toDatabase(data)
		);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async getById(id: number): Promise<any> {
		const result = await this.ResourceModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async findOne(query: any): Promise<any> {
		const result = await this.ResourceModel.findOne({
			where: query,
			...this.queryOptions,
		});
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async findAll(query?: any): Promise<any> {
		const result = await this.ResourceModel.findAll({
			where: query,
			...this.queryOptions,
		});
		if (!result) return null;

		return result.map(this.resourceMapper.toEntity);
	}

	public async update(id: number, data: any): Promise<any> {
		const where = {
			id: Number(id),
		};
		await this.ResourceModel.update(data, { where });
		const result = await this.ResourceModel.findByPk(id);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async list(query?: any): Promise<{
		content: any[];
		pageNumber: number;
		pageSize: number;
		totalPages: number;
		totalItems: number;
	}> {
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

	public async count(query: any): Promise<any> {
		const resource = await this.ResourceModel.count({
			where: query,
			...this.queryOptions,
		});

		return Number(resource);
	}


	public async deleteOne(id: number, softDelete = true, agentId: number | string | null = null): Promise<any> {
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
		if (!result) return null;

		return result;
	}

	public async deleteMany(ids: Array<number>, softDelete = true, agentId: number | string | null = null): Promise<any> {
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
			if (!registers) return null;

			for (const register of registers) {
				result = result && await register.destroy();
			}
		}

		return result;
	}

	public async executeQuery(sqlQuery: string, QueryType?: QueryTypes): Promise<any> {
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
