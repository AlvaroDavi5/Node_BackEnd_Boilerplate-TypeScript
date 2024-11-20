import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import Exceptions from '@core/errors/Exceptions';
import AbstractRepository from '@core/infra/database/repositories/AbstractRepository.repository';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';
import userPreferenceMapper from './userPreference.mapper';
import { userPreferenceQueryParamsBuilder, UserPreferenceBuildParamsInterface } from './userPreference.query';


@Injectable()
export default class UserPreferenceRepository extends AbstractRepository<UserPreferencesModel, UserPreferenceEntity, UserPreferenceBuildParamsInterface> {
	constructor(
		@Inject(DATABASE_CONNECTION_PROVIDER) connection: DataSource,
		@Inject(REQUEST_LOGGER_PROVIDER) logger: LoggerService,
			exceptions: Exceptions,
	) {
		logger.setContextName(UserPreferenceRepository.name);
		super({
			connection,
			DomainEntity: UserPreferenceEntity,
			ResourceModel: UserPreferencesModel,
			ResourceRepo: UserPreferencesModel.getRepository(),
			resourceMapper: userPreferenceMapper,
			queryParamsBuilder: userPreferenceQueryParamsBuilder,
			exceptions,
			logger,
		});
	}
}
