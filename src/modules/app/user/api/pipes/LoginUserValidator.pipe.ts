import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import loginUserSchema, { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock, dataParserHelperMock } from '@dev/mocks/mockedModules';
import LoginUserInputDto from '../dto/user/LoginUserInput.dto';


export default class LoginUserValidatorPipe implements PipeTransform<LoginUserInputDto, LoginUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		const logger = new LoggerService(LoginUserValidatorPipe.name, configServiceMock as ConfigService, dataParserHelperMock as DataParserHelper);
		this.schemaValidator = new SchemaValidator(new Exceptions(), logger);
	}

	public transform(value: LoginUserInputDto, metadata: ArgumentMetadata): LoginUserSchemaInterface {
		return this.schemaValidator.validate<LoginUserSchemaInterface>(value, metadata, loginUserSchema);
	}
}
