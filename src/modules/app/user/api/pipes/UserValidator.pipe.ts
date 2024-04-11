import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import createUserSchema, { CreateUserSchemaInterface } from '@app/user/api/schemas/user/createUser.schema';
import updateUserSchema, { UpdateUserSchemaInterface } from '@app/user/api/schemas/user/updateUser.schema';
import loginUserSchema, { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import { CreateUserInputDto, UpdateUserInputDto, LoginUserInputDto } from '@app/user/api/dto/UserInput.dto';


export class CreateUserPipeValidator implements PipeTransform<CreateUserInputDto, CreateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<CreateUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<CreateUserSchemaInterface>(new Exceptions());
	}

	public transform(value: CreateUserInputDto, metadata: ArgumentMetadata): CreateUserSchemaInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, createUserSchema);
	}
}

export class UpdateUserPipeValidator implements PipeTransform<UpdateUserInputDto, UpdateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<UpdateUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<UpdateUserSchemaInterface>(new Exceptions());
	}

	public transform(value: UpdateUserInputDto, metadata: ArgumentMetadata): UpdateUserSchemaInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, updateUserSchema);
	}
}

export class LoginUserPipeValidator implements PipeTransform<LoginUserInputDto, LoginUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<LoginUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<LoginUserSchemaInterface>(new Exceptions());
	}

	public transform(value: LoginUserInputDto, metadata: ArgumentMetadata): LoginUserSchemaInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, loginUserSchema);
	}
}
