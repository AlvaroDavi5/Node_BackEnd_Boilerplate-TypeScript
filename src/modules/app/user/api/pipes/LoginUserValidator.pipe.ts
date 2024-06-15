import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';
import loginUserSchema, { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import LoginUserInputDto from '../dto/user/LoginUserInput.dto';


export default class LoginUserValidatorPipe implements PipeTransform<LoginUserInputDto, LoginUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<LoginUserSchemaInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<LoginUserSchemaInterface>(new Exceptions(), generateLogger(LoginUserValidatorPipe.name));
	}

	public transform(value: LoginUserInputDto, metadata: ArgumentMetadata): LoginUserSchemaInterface {
		return this.schemaValidator.validate(value, metadata, loginUserSchema);
	}
}
