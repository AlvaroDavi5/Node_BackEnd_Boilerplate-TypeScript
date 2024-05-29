import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import createUserSchema from '@app/user/api/schemas/user/createUser.schema';
import updateUserSchema from '@app/user/api/schemas/user/updateUser.schema';
import loginUserSchema, { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import { CreateUserInterface, UpdateUserInterface } from '@domain/entities/User.entity';
import { CreateUserInputDto, UpdateUserInputDto, LoginUserInputDto } from '@app/user/api/dto/UserInput.dto';
import { generateLogger } from '@core/logging/logger';


export class CreateUserValidatorPipe implements PipeTransform<CreateUserInputDto, CreateUserInterface> {
	private readonly schemaValidator: SchemaValidator<CreateUserInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<CreateUserInterface>(new Exceptions(), generateLogger(CreateUserValidatorPipe.name));
	}

	public transform(value: CreateUserInputDto, metadata: ArgumentMetadata): CreateUserInterface {
		return this.schemaValidator.validate(value, metadata, createUserSchema);
	}
}

export class UpdateUserValidatorPipe implements PipeTransform<UpdateUserInputDto, UpdateUserInterface> {
	private readonly schemaValidator: SchemaValidator<UpdateUserInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<UpdateUserInterface>(new Exceptions(), generateLogger(UpdateUserValidatorPipe.name));
	}

	public transform(value: UpdateUserInputDto, metadata: ArgumentMetadata): UpdateUserInterface {
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
