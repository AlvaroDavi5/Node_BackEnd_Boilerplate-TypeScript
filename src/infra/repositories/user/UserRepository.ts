import Repository from '../Repository';
import UserEntity from 'src/domain/entities/User';
import UsersModel from 'src/infra/database/models/Users';
import userMapper from './userMapper';
import { userQueryParamsBuilder, userQueryOptions } from './userQuery';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class UserRepository extends Repository {

	constructor({
		exceptions,
		logger,
	}: ContainerInterface) {
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

	async getById(id: number, restrictData: boolean = true) {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutPassword') : this.ResourceModel;

		const result = await userModel.findByPk(
			id,
			this.queryOptions,
		);
		if (!result) return;

		return this.resourceMapper.toEntity(result);
	}

	async list(query?: any, restrictData: boolean = true) {
		const userModel = (restrictData) ? this.ResourceModel.scope('withoutSensibleData') : this.ResourceModel;
		const buildedQuery = this.queryParamsBuilder?.buildParams(query);

		const { rows, count } = await userModel.findAndCountAll(buildedQuery);

		const totalPages = Math.ceil(count / parseInt(query?.size)) || 1;
		const pageNumber = parseInt(query?.page) || 0;
		const pageSize = parseInt(query?.limit) || count;

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
}
