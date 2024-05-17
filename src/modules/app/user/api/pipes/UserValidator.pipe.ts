import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import createUserSchema, { CreateUserSchemaInterface } from '@app/user/api/schemas/user/createUser.schema';
import updateUserSchema, { UpdateUserSchemaInterface } from '@app/user/api/schemas/user/updateUser.schema';
import loginUserSchema, { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import { CreateUserInputDto, UpdateUserInputDto, LoginUserInputDto } from '@app/user/api/dto/UserInput.dto';
import { generateLogger } from '@core/logging/logger';


export class CreateUserValidatorPipe implements PipeTransform<CreateUserInputDto, CreateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<CreateUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<CreateUserSchemaInterface>(new Exceptions(), generateLogger(CreateUserValidatorPipe.name));
	}

	public transform(value: CreateUserInputDto, metadata: ArgumentMetadata): CreateUserSchemaInterface {
		return this.schemaValidator.validate(value, metadata, createUserSchema);
	}
}

export class UpdateUserValidatorPipe implements PipeTransform<UpdateUserInputDto, UpdateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<UpdateUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<UpdateUserSchemaInterface>(new Exceptions(), generateLogger(UpdateUserValidatorPipe.name));
	}

	public transform(value: UpdateUserInputDto, metadata: ArgumentMetadata): UpdateUserSchemaInterface {
		return this.schemaValidator.validate(value, metadata, updateUserSchema);
	}
}

export class LoginUserValidatorPipe implements PipeTransform<LoginUserInputDto, LoginUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<LoginUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<LoginUserSchemaInterface>(new Exceptions(), generateLogger(LoginUserValidatorPipe.name));
	}

	public transform(value: LoginUserInputDto, metadata: ArgumentMetadata): LoginUserSchemaInterface {
		return this.schemaValidator.validate(value, metadata, loginUserSchema);
	}
}
