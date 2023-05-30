import Repository from '../AbstractRepository';
import UserPreference from 'src/domain/entities/UserPreference';
import UserPreferencesModel from 'src/infra/database/models/UserPreferences';
import userPreferenceMapper from './userPreferenceMapper';
import { userPreferenceQueryParamsBuilder, userPreferenceQueryOptions } from './userPreferenceQuery';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class UserRepository extends Repository {

	constructor({
		exceptions,
		logger,
	}: ContainerInterface) {
		super({
			DomainEntity: UserPreference,
			ResourceModel: UserPreferencesModel,
			resourceMapper: userPreferenceMapper,
			queryParamsBuilder: userPreferenceQueryParamsBuilder,
			queryOptions: userPreferenceQueryOptions,
			exceptions: exceptions,
			logger: logger,
		});
	}

}
