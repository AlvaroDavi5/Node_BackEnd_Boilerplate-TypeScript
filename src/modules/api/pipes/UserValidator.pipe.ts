import { PipeTransform } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import configs from '@core/configs/configs.config';
import createUserSchema, { CreateUserSchemaInterface } from '../schemas/user/createUser.schema';
import updateUserSchema, { UpdateUserSchemaInterface } from '../schemas/user/updateUser.schema';
import listQuerySchema from '../schemas/listQuery.schema';
import { ListQueryInterface } from 'src/types/_listPaginationInterface';


export class ListQueryValidatorPipe implements PipeTransform<any, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator<ListQueryInterface>;

	constructor() {
		const appConfigs: any = configs();
		const configServiceMock: any = {
			get: (propertyPath?: string) => {
				if (propertyPath)
					return appConfigs[propertyPath];
				else
					return appConfigs;
			},
		};

		this.schemaValidator = new SchemaValidator<ListQueryInterface>(new Exceptions(configServiceMock));
	}

	public transform(data: any): ListQueryInterface {
		return this.schemaValidator.validate(data, listQuerySchema);
	}
}

export class CreateUserValidatorPipe implements PipeTransform<any, CreateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<CreateUserSchemaInterface>;

	constructor() {
		const appConfigs: any = configs();
		const configServiceMock: any = {
			get: (propertyPath?: string) => {
				if (propertyPath)
					return appConfigs[propertyPath];
				else
					return appConfigs;
			},
		};

		this.schemaValidator = new SchemaValidator<CreateUserSchemaInterface>(new Exceptions(configServiceMock));
	}

	public transform(data: any): CreateUserSchemaInterface {
		return this.schemaValidator.validate(data, createUserSchema);
	}
}

export class UpdateUserValidatorPipe implements PipeTransform<any, UpdateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<UpdateUserSchemaInterface>;

	constructor() {
		const appConfigs: any = configs();
		const configServiceMock: any = {
			get: (propertyPath?: string) => {
				if (propertyPath)
					return appConfigs[propertyPath];
				else
					return appConfigs;
			},
		};

		this.schemaValidator = new SchemaValidator<UpdateUserSchemaInterface>(new Exceptions(configServiceMock));
	}

	public transform(data: any): UpdateUserSchemaInterface {
		return this.schemaValidator.validate(data, updateUserSchema);
	}
}
