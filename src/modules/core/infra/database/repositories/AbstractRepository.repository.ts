import { DataSource, BaseEntity, Repository, FindOneOptions, FindManyOptions, FindOptionsOrder, UpdateResult, DeleteResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import AbstractEntity from '@common/classes/AbstractEntity.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { classConstructorType } from '@shared/internal/types/constructorType';


export interface PaginationOptionsInterface<M extends BaseEntity> {
	take?: number, // limit
	skip?: number, // offset
	order?: FindOptionsOrder<M>,
}
export type BuildParamsInterface<I = unknown> = ListQueryInterface & Partial<I>;

type ModelType<E extends BaseEntity> = classConstructorType<E> & typeof BaseEntity;

/* eslint-disable @typescript-eslint/no-explicit-any */
export default abstract class AbstractRepository<M extends BaseEntity, E extends AbstractEntity, BI extends BuildParamsInterface> {
	// ? ------ Attributes ------
	private DomainEntity: classConstructorType<E>;
	private ResourceModel: ModelType<M>;

	protected resourceRepository: Repository<M>;
	protected resourceMapper: {
		toDomainEntity: (dataValues: M) => E,
		toDatabaseEntity: (entity: E) => M,
	};
	protected queryParamsBuilder: {
		buildParams: (data: BI) => FindManyOptions<M>,
	};
	protected exceptions: Exceptions;
	protected logger: LoggerService;

	// ! ------ Class Constructor ------
	constructor({
		connection,
		DomainEntity,
		ResourceModel,
		resourceMapper,
		queryParamsBuilder,
		exceptions,
		logger,
	}: {
		connection: DataSource,
		DomainEntity: classConstructorType<E>,
		ResourceModel: ModelType<M>,
		resourceMapper: {
			toDomainEntity: (dataValues: M) => E,
			toDatabaseEntity: (entity: E) => M,
		},
		queryParamsBuilder: {
			buildParams: (data: BI) => FindManyOptions<M>,
		},
		exceptions: Exceptions,
		logger: LoggerService,
	}) {
		this.DomainEntity = DomainEntity;
		this.ResourceModel = ResourceModel;
		this.ResourceModel.useDataSource(connection);

		this.resourceRepository = this.ResourceModel.getRepository();
		this.resourceMapper = resourceMapper;
		this.queryParamsBuilder = queryParamsBuilder;
		this.exceptions = exceptions;
		this.logger = logger;
	}

	// * ------ Methods ------
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

	public async create(entity: E): Promise<E> {
		try {
			this.validatePayload(entity);

			const result = await this.resourceRepository.create(
				this.resourceMapper.toDatabaseEntity(entity)
			).save();

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async getById(id: string): Promise<E | null> {
		try {
			const result = await this.resourceRepository.findOne({ where: { id } as any });
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async findOne(query: FindOneOptions<M>): Promise<E | null> {
		try {
			const result = await this.resourceRepository.findOne(query);
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async findAll(query?: FindManyOptions<M>): Promise<E[]> {
		try {
			const result = await this.resourceRepository.find(query);

			return result.map(this.resourceMapper.toDomainEntity);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async update(id: string, dataValues: QueryDeepPartialEntity<M>): Promise<E | null> {
		try {
			const query: FindOneOptions<M> = {
				where: { id } as any,
			};

			await this.resourceRepository.update(id, dataValues);
			const result = await this.resourceRepository.findOne(query);
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async list(query?: ListQueryInterface): Promise<PaginationInterface<E>> {
		try {
			const buildedQuery = this.queryParamsBuilder.buildParams(query as any);
			const { 0: rows, 1: count } = await this.resourceRepository.findAndCount(buildedQuery);

			const totalItems = count;
			const totalPages = Math.ceil(totalItems / (query?.limit ?? 1)) || 1;
			const pageNumber = query?.page ?? 0;
			const pageSize = rows.length;

			let content: E[] = [];
			if (rows.length) {
				content = rows.map((register) => this.resourceMapper.toDomainEntity(register));
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

	public async count(query: FindManyOptions<M> | undefined): Promise<number> {
		try {
			const counter = await this.resourceRepository.count(query);

			return counter;
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteOne(id: string, softDelete = true): Promise<boolean> {
		try {
			let result: UpdateResult | DeleteResult | null = null;

			if (softDelete) {
				result = await this.resourceRepository.softDelete(id);
			} else {
				result = await this.resourceRepository.delete(id);
			}

			return !!result?.affected;
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteMany(ids: string[], softDelete = true): Promise<number> {
		try {
			let result: UpdateResult | DeleteResult | null = null;

			if (softDelete) {
				result = await this.resourceRepository.softDelete(ids);
			} else {
				result = await this.resourceRepository.delete(ids);
			}

			return Number(result?.affected ?? 0);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async executeQuery(sqlQuery: string): Promise<unknown> {
		try {
			const result = await this.resourceRepository.query(sqlQuery);
			return result;
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}
}
/* eslint-enable @typescript-eslint/no-explicit-any */
