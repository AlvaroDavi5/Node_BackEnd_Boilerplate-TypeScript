import { DataSource, BaseEntity, In, Repository, FindOneOptions, FindManyOptions, FindOptionsOrder, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { fromDateTimeToISO, getDateTimeNow } from '@common/utils/dates.util';
import LoggerService from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import AbstractEntity from '@shared/internal/classes/AbstractEntity.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { constructorType } from '@shared/internal/types/constructorType';


export interface PaginationOptionsInterface<M extends BaseEntity> {
	take?: number, // limit
	skip?: number, // offset
	order?: FindOptionsOrder<M>,
}
export type BuildParamsInterface<I = any> = ListQueryInterface & Partial<I>;

type ModelType<E extends BaseEntity> = constructorType<E> & typeof BaseEntity;

export default abstract class AbstractRepository<M extends BaseEntity, E extends AbstractEntity, BI extends BuildParamsInterface> {
	// ? ------ Attributes ------
	protected DomainEntity: constructorType<E>;
	protected ResourceModel: ModelType<M>;
	protected ResourceRepo: Repository<M>;
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
		ResourceRepo,
		resourceMapper,
		queryParamsBuilder,
		exceptions,
		logger,
	}: {
		connection: DataSource,
		DomainEntity: constructorType<E>,
		ResourceModel: ModelType<M>,
		ResourceRepo: Repository<M>,
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
		this.ResourceRepo = ResourceRepo;
		this.resourceMapper = resourceMapper;
		this.queryParamsBuilder = queryParamsBuilder;
		this.exceptions = exceptions;
		this.logger = logger;
	}

	// * ------ Methods ------
	protected getISODateNow(): string {
		return fromDateTimeToISO(getDateTimeNow(TimeZonesEnum.America_SaoPaulo));
	}

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

			const result = await this.ResourceRepo.create(
				this.resourceMapper.toDatabaseEntity(entity)
			).save();

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async getById(id: string): Promise<E | null> {
		try {
			const result = await this.ResourceRepo.findOne({ where: { id } as any });
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async findOne(query: FindOneOptions<M>): Promise<E | null> {
		try {
			const result = await this.ResourceRepo.findOne(query);
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async findAll(query?: FindManyOptions<M>): Promise<E[]> {
		try {
			const result = await this.ResourceRepo.find(query);

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

			const timestamp = this.getISODateNow();
			(dataValues as any).updatedAt = timestamp;
			await this.ResourceRepo.update(id, dataValues);
			const result = await this.ResourceRepo.findOne(query);
			if (!result) return null;

			return this.resourceMapper.toDomainEntity(result);
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async list(query?: ListQueryInterface): Promise<PaginationInterface<E>> {
		try {
			const buildedQuery = this.queryParamsBuilder.buildParams(query as any);
			const { 0: rows, 1: count } = await this.ResourceRepo.findAndCount(buildedQuery);

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
			const counter = await this.ResourceRepo.count(query);

			return counter;
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteOne(id: string, softDelete = true): Promise<boolean> {
		try {
			const query: FindOneOptions<M> = {
				where: { id } as any,
			};

			let result: UpdateResult | M | null = null;
			if (softDelete) {
				const timestamp = this.getISODateNow();
				result = await this.ResourceRepo.update(id, {
					deletedAt: timestamp,
				} as any);
				if (result !== null && result !== undefined) {
					const res = result.affected
						? result.affected > 0
						: true;
					return res;
				} else
					return false;
			} else {
				const register = await this.ResourceRepo.findOne(query);
				if (register) {
					result = await register.remove();
					return true;
				}
				return false;
			}
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async deleteMany(ids: string[], softDelete = true): Promise<number> {
		try {
			const query: FindManyOptions<M> = {
				where: { id: In(ids) } as any,
			};

			let result: UpdateResult | M | null = null;
			if (softDelete) {
				const timestamp = this.getISODateNow();
				result = await this.ResourceRepo.update(ids, {
					deletedAt: timestamp,
				} as any);
				return Number(result.affected);
			} else {
				const registers = await this.ResourceRepo.find(query);
				if (!registers) return 0;

				let counter = 0;
				for (const register of registers) {
					result = await register.remove();
					counter++;
				}
				return counter;
			}
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}

	public async executeQuery(sqlQuery: string): Promise<any> {
		try {
			const result = await this.ResourceRepo.query(sqlQuery);
			return result;
		} catch (error) {
			throw this.exceptions.internal(error as Error);
		}
	}
}
