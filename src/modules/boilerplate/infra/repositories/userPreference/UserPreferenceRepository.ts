import { Injectable } from '@nestjs/common';
import LoggerGenerator from '@infra/logging/logger';
import Exceptions from '@infra/errors/exceptions';
import AbstractRepository from '@infra/database/repository/AbstractRepository';
import UserPreferencesModel from '@infra/database/models/UserPreferences';
import UserPreference from '@modules/boilerplate/domain/entities/UserPreference';
import userPreferenceMapper from './userPreferenceMapper';
import { userPreferenceQueryParamsBuilder, userPreferenceQueryOptions } from './userPreferenceQuery';


@Injectable()
export default class UserRepository extends AbstractRepository {
	constructor(
		exceptions: Exceptions,
		logger: LoggerGenerator,
	) {
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
