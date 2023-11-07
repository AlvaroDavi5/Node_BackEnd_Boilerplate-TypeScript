import { Injectable } from '@nestjs/common';
import { Association } from 'sequelize';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import Exceptions from '@core/infra/errors/Exceptions';
import AbstractRepository from '@core/infra/database/repositories/AbstractRepository.repository';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel, { userPreferenceAttributes, userPreferenceOptions } from '@core/infra/database/models/UserPreferences.model';
import UserPreferenceEntity from '@app/domain/entities/UserPreference.entity';
import userPreferenceMapper from './userPreference.mapper';
import { userPreferenceQueryParamsBuilder, userPreferenceQueryOptions } from './userPreference.query';


@Injectable()
export default class UserRepository extends AbstractRepository<UserPreferencesModel, UserPreferenceEntity> {
	public static associations: {
		user: Association<UsersModel>
	};

	constructor(
		exceptions: Exceptions,
		loggerGenerator: LoggerGenerator,
	) {
		super({
			DomainEntity: UserPreferenceEntity,
			ResourceModel: UserPreferencesModel,
			resourceAttributes: userPreferenceAttributes,
			resourceOptions: userPreferenceOptions,
			resourceMapper: userPreferenceMapper,
			queryParamsBuilder: userPreferenceQueryParamsBuilder,
			queryOptions: userPreferenceQueryOptions,
			exceptions: exceptions,
			loggerGenerator: loggerGenerator,
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
