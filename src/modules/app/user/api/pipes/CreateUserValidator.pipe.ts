import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';
import createUserSchema from '@app/user/api/schemas/user/createUser.schema';
import { ICreateUser } from '@domain/entities/User.entity';
import CreateUserInputDto from '../dto/user/CreateUserInput.dto';


export default class CreateUserValidatorPipe implements PipeTransform<CreateUserInputDto, ICreateUser> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		this.schemaValidator = new SchemaValidator(new Exceptions(), generateLogger(CreateUserValidatorPipe.name));
	}

	public transform(value: CreateUserInputDto, metadata: ArgumentMetadata): ICreateUser {
		return this.schemaValidator.validate<ICreateUser>(value, metadata, createUserSchema);
	}
}
