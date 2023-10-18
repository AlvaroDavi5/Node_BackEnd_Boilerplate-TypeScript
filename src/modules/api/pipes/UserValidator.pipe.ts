import { PipeTransform } from '@nestjs/common';
import SchemaValidator from '@modules/utils/common/validators/SchemaValidator.validator';
import Exceptions from '@infra/errors/Exceptions';
import createUserSchema, { CreateUserSchemaInterface } from '../schemas/user/createUser.schema';
import updateUserSchema, { UpdateUserSchemaInterface } from '../schemas/user/updateUser.schema';
import configs from '@configs/configs.config';


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

		this.schemaValidator = new SchemaValidator(new Exceptions(configServiceMock));
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

		this.schemaValidator = new SchemaValidator(new Exceptions(configServiceMock));
	}

	public transform(data: any): UpdateUserSchemaInterface {
		return this.schemaValidator.validate(data, updateUserSchema);
	}
}
