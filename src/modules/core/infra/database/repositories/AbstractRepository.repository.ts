import { Model, Op, QueryTypes, ModelAttributes, InitOptions } from 'sequelize';
import { Logger } from 'winston';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import Exceptions from '@core/infra/errors/Exceptions';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';
import { TypeConstructor } from 'src/types/_typeConstructor';
import { ListQueryInterface, PaginationInterface } from 'src/types/_listPaginationInterface';


type ModelType<T extends Model<T>> = TypeConstructor<T> & typeof Model;

export default abstract class AbstractRepository<M extends Model, E extends AbstractEntity> {
	// * ------ Attributes ------
	protected DomainEntity: TypeConstructor<E>;
	protected ResourceModel: ModelType<M>;
	protected resourceMapper: {
		toDatabase: (entity: E) => any,
		toEntity: ({ dataValues }: any) => E,
	};

	protected queryParamsBuilder: {
		buildParams: (data: any) => any,
	};

	protected queryOptions: any;
	protected exceptions: Exceptions;
	protected logger: Logger;

	// // ------ Associations Attribute ------
	public static associations: any = {};

	// ! ------ Class Constructor ------
	constructor({
		DomainEntity,
		ResourceModel,
		resourceAttributes,
		resourceOptions,
		resourceMapper,
		queryParamsBuilder,
		queryOptions,
		exceptions,
		loggerGenerator,
	}: {
		DomainEntity: TypeConstructor<E>,
		ResourceModel: ModelType<M>,
		resourceAttributes: ModelAttributes,
		resourceOptions: InitOptions,
		resourceMapper: {
			toDatabase: (entity: E) => any,
			toEntity: ({ dataValues }: any) => E,
		},
		queryParamsBuilder: {
			buildParams: (data: any) => any,
		},
		queryOptions: any,
		exceptions: Exceptions,
		loggerGenerator: LoggerGenerator,
	}) {
		this.DomainEntity = DomainEntity;
		this.ResourceModel = ResourceModel;
		this.resourceMapper = resourceMapper;
		this.queryParamsBuilder = queryParamsBuilder;
		this.queryOptions = queryOptions;
		this.exceptions = exceptions;
		this.logger = loggerGenerator.getLogger();

		this.ResourceModel.init(resourceAttributes, resourceOptions);
		this.associate();
	}

	/**
	 * ?    Association Methods
	 * @belongsTo - One-to-One, source -> target
	 * @hasOne - One-to-One, target -> source
	 * @hasMany - One-to-Many, target -> source
	 * @belongsToMany - Many-to-Many, source -> target
	**/
	public associate(): void { console.log('Associated'); }

	// ? ------ Methods ------
	public validatePayload(entity: E): void {
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

	public async create(data: any): Promise<E | null> {
		const result = await this.ResourceModel.create(
			this.resourceMapper.toDatabase(data)
		);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async getById(id: number): Promise<E | null> {
		const result = await this.ResourceModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async findOne(query: any): Promise<E | null> {
		const result = await this.ResourceModel.findOne({
			where: query,
			...this.queryOptions,
		});
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async findAll(query?: any): Promise<E[] | null> {
		const result = await this.ResourceModel.findAll({
			where: query,
			...this.queryOptions,
		});
		if (!result) return null;

		return result.map(this.resourceMapper.toEntity);
	}

	public async update(id: number, data: any): Promise<E | null> {
		const where: any = {
			id: Number(id),
		};
		await this.ResourceModel.update(data, { where });
		const result = await this.ResourceModel.findByPk(id);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async list(query?: ListQueryInterface): Promise<PaginationInterface<E>> {
		const buildedQuery = this.queryParamsBuilder?.buildParams(query);
		const { rows, count } = await this.ResourceModel.findAndCountAll(buildedQuery);

		const totalPages = Math.ceil(count / (query?.size || 1)) || 1;
		const pageNumber = query?.page || 0;
		const pageSize = query?.limit || count;

		let content: E[] = [];
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

	public async count(query: any): Promise<number> {
		const resource = await this.ResourceModel.count({
			where: query,
			...this.queryOptions,
		});

		let counter = 0;
		resource.forEach(group => {
			counter += group.count;
		});

		return counter;
	}

	public async deleteOne(id: number, softDelete = true, agentId: number | string | null = null): Promise<boolean> {
		const where: any = {
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
			if (register) {
				result = await register?.destroy();
				return true;
			}
		}
		if (!result) return false;

		return result[0] == 1;
	}

	public async deleteMany(ids: Array<number>, softDelete = true, agentId: number | string | null = null): Promise<number> {
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
			if (!registers) return 0;

			let counter = 0;
			for (const register of registers) {
				await register.destroy();
				counter++;
			}
			return counter;
		}
		if (!result) return 0;

		return result?.[0];
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
