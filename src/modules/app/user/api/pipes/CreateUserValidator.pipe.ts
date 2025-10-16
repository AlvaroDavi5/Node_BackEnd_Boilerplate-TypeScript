import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import { ICreateUser } from '@domain/entities/User.entity';
import createUserSchema from '@app/user/api/schemas/user/createUser.schema';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock, dataParserHelperMock } from '@dev/mocks/mockedModules';
import CreateUserInputDto from '../dto/user/CreateUserInput.dto';


export default class CreateUserValidatorPipe implements PipeTransform<CreateUserInputDto, ICreateUser> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		const logger = new LoggerService(CreateUserValidatorPipe.name, configServiceMock as ConfigService, dataParserHelperMock as DataParserHelper);
		this.schemaValidator = new SchemaValidator(new Exceptions(), logger);
	}

	public transform(value: CreateUserInputDto, metadata: ArgumentMetadata): ICreateUser {
		return this.schemaValidator.validate<ICreateUser>(value, metadata, createUserSchema);
	}
}
