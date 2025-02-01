import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';
import loginUserSchema, { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import LoginUserInputDto from '../dto/user/LoginUserInput.dto';


export default class LoginUserValidatorPipe implements PipeTransform<LoginUserInputDto, LoginUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		this.schemaValidator = new SchemaValidator(new Exceptions(), generateLogger(LoginUserValidatorPipe.name));
	}

	public transform(value: LoginUserInputDto, metadata: ArgumentMetadata): LoginUserSchemaInterface {
		return this.schemaValidator.validate<LoginUserSchemaInterface>(value, metadata, loginUserSchema);
	}
}
