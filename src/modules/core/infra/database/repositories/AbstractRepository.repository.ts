import { Model, Op, QueryTypes, ModelAttributes, Includeable, InitOptions, FindAndCountOptions, Attributes } from 'sequelize';
import { Logger } from 'winston';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import Exceptions from '@core/infra/errors/Exceptions';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/interfaces/listPaginationInterface';
import { constructorType } from '@shared/types/constructorType';


type ModelType<T extends Model<T>> = constructorType<T> & typeof Model;

export default abstract class AbstractRepository<M extends Model, E extends AbstractEntity> {
	// * ------ Attributes ------
	protected DomainEntity: constructorType<E>;
	protected ResourceModel: ModelType<M>;
	protected resourceMapper: {
		toEntity: ({ dataValues }: M) => E,
		toDatabase: (entity: E) => any,
	};

	protected queryParamsBuilder: {
		buildParams: (data: any) => Omit<FindAndCountOptions<Attributes<M>>, 'group'>,
	};

	protected queryOptions: { include: Includeable[] };
	protected exceptions: Exceptions;
	protected dateGeneratorHelper: DateGeneratorHelper;
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
		dateGeneratorHelper,
	}: {
		DomainEntity: constructorType<E>,
		ResourceModel: ModelType<M>,
		resourceAttributes: ModelAttributes,
		resourceOptions: InitOptions,
		resourceMapper: {
			toEntity: ({ dataValues }: M) => E,
			toDatabase: (entity: E) => any,
		},
		queryParamsBuilder: {
			buildParams: (data: any) => any,
		},
		queryOptions: any,
		exceptions: Exceptions,
		loggerGenerator: LoggerGenerator,
		dateGeneratorHelper: DateGeneratorHelper,
	}) {
		this.DomainEntity = DomainEntity;
		this.ResourceModel = ResourceModel;
		this.resourceMapper = resourceMapper;
		this.queryParamsBuilder = queryParamsBuilder;
		this.queryOptions = queryOptions;
		this.exceptions = exceptions;
		this.logger = loggerGenerator.getLogger();
		this.dateGeneratorHelper = dateGeneratorHelper;

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
				message: `ValidationError: ${error?.name}`,
				details: error?.message,
				stack: error?.stack,
			});
		}
	}

	public async create(entity: E): Promise<E | null> {
		const result = await this.ResourceModel.create(
			this.resourceMapper.toDatabase(entity)
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

	public async update(id: number, entity: E): Promise<E | null> {
		const where: any = {
			id: Number(id),
		};
		await this.ResourceModel.update(entity, { where });
		const result = await this.ResourceModel.findByPk(id);
		if (!result) return null;

		return this.resourceMapper.toEntity(result);
	}

	public async list(query?: ListQueryInterface): Promise<PaginationInterface<E>> {
		const buildedQuery = this.queryParamsBuilder.buildParams(query);
		const { rows, count } = await this.ResourceModel.findAndCountAll(buildedQuery);

		const totalItems = count;
		const totalPages = Math.ceil(totalItems / (query?.limit ?? 1)) || 1;
		const pageNumber = query?.page ?? 0;
		const pageSize = rows.length;

		let content: E[] = [];
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

	public async count(query: any): Promise<number> {
		const counter = await this.ResourceModel.count({
			where: query,
			...this.queryOptions,
		});

		return counter;
	}

	public async deleteOne(id: number, softDelete = true, agentId: number | string | null = null): Promise<boolean> {
		const where: any = {
			id: Number(id),
		};

		let result = null;
		if (softDelete) {
			const timestamp = this.dateGeneratorHelper.getDate(true);
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
			const timestamp = this.dateGeneratorHelper.getDate(true);
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
