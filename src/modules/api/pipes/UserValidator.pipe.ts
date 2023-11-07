import { PipeTransform } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import configs from '@core/configs/configs.config';
import createUserSchema, { CreateUserSchemaInterface } from '@api/schemas/user/createUser.schema';
import updateUserSchema, { UpdateUserSchemaInterface } from '@api/schemas/user/updateUser.schema';


export class CreateUserValidatorPipe implements PipeTransform<unknown, CreateUserSchemaInterface> {
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

	public transform(data: unknown): CreateUserSchemaInterface {
		return this.schemaValidator.validate(data, createUserSchema);
	}
}

export class UpdateUserValidatorPipe implements PipeTransform<unknown, UpdateUserSchemaInterface> {
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

	public transform(data: unknown): UpdateUserSchemaInterface {
		return this.schemaValidator.validate(data, updateUserSchema);
	}
}
