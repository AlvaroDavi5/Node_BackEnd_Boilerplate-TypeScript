import { Injectable } from '@nestjs/common';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import Exceptions from '@infra/errors/Exceptions';
import AbstractRepository from '@infra/database/repositories/AbstractRepository.repository';
import UserPreferencesModel from '@infra/database/models/UserPreferences.model';
import UserPreference from '@modules/app/domain/entities/UserPreference.entity';
import userPreferenceMapper from './userPreference.mapper';
import { userPreferenceQueryParamsBuilder, userPreferenceQueryOptions } from './userPreference.query';


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
