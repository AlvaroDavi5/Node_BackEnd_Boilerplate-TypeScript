import Repository from '../Repository';
import UserEntity from 'src/domain/entities/User';
import UsersModel from 'src/infra/database/models/Users';
import { ContainerInterface } from 'src/container';


export default class UserRepository extends Repository {

	constructor({
		exceptions,
		logger,
	}: ContainerInterface) {
		super({
			DomainEntity: UserEntity,
			ResourceModel: UsersModel,
			resourceMapper: {
				toDatabase: (data: any) => data,
				toEntity: (data: any) => data,
			},
			queryParamsBuilder: {
				buildParams: (data: any) => data,
			},
			queryOptions: null,
			exceptions,
			logger,
		});
	}

	async list(query?: any) {
		const buildedQuery = this.queryParamsBuilder?.buildParams(query);
		const { rows, count } = await this.ResourceModel.scope('withoutSensibleData').findAndCountAll(buildedQuery);

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
}
