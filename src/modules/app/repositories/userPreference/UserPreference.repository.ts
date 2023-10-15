import { Injectable } from '@nestjs/common';
import { Association } from 'sequelize';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import Exceptions from '@infra/errors/Exceptions';
import AbstractRepository from '@infra/database/repositories/AbstractRepository.repository';
import UserPreferencesModel, { userPreferenceAttributes, userPreferenceOptions } from '@infra/database/models/UserPreferences.model';
import UserPreferenceEntity from '@modules/app/domain/entities/UserPreference.entity';
import userPreferenceMapper from './userPreference.mapper';
import { userPreferenceQueryParamsBuilder, userPreferenceQueryOptions } from './userPreference.query';
import UsersModel from '@infra/database/models/Users.model';


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

	public associate() {
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
