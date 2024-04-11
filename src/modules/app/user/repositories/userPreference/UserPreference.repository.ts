import { Injectable, Inject } from '@nestjs/common';
import { Sequelize, Association } from 'sequelize';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import Exceptions from '@core/infra/errors/Exceptions';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import AbstractRepository from '@core/infra/database/repositories/AbstractRepository.repository';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel, { userPreferenceAttributes, userPreferenceOptions } from '@core/infra/database/models/UserPreferences.model';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';
import userPreferenceMapper from './userPreference.mapper';
import { userPreferenceQueryParamsBuilder, userPreferenceQueryOptions } from './userPreference.query';


@Injectable()
export default class UserRepository extends AbstractRepository<UserPreferencesModel, UserPreferenceEntity> {
	public static associations: {
		user: Association<UsersModel>
	};

	constructor(
		@Inject(DATABASE_CONNECTION_PROVIDER)
			connection: Sequelize,
			exceptions: Exceptions,
		@Inject(LOGGER_PROVIDER)
			loggerProvider: LoggerProviderInterface,
			dateGeneratorHelper: DateGeneratorHelper,
	) {
		userPreferenceOptions.sequelize = connection;
		super({
			DomainEntity: UserPreferenceEntity,
			ResourceModel: UserPreferencesModel,
			resourceAttributes: userPreferenceAttributes,
			resourceOptions: userPreferenceOptions,
			resourceMapper: userPreferenceMapper,
			queryParamsBuilder: userPreferenceQueryParamsBuilder,
			queryOptions: userPreferenceQueryOptions,
			exceptions: exceptions,
			loggerProvider: loggerProvider,
			dateGeneratorHelper: dateGeneratorHelper,
		});
	}

	public associate(): void {
		this.ResourceModel.belongsTo(
			UsersModel,
			{
				constraints: true,
				foreignKeyConstraint: true,
				foreignKey: 'userId',
				targetKey: 'id',
				as: 'user',
			}
		);
	}
}
