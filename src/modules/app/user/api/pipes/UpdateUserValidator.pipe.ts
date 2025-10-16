import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import { IUpdateUser } from '@domain/entities/User.entity';
import updateUserSchema from '@app/user/api/schemas/user/updateUser.schema';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock, dataParserHelperMock } from '@dev/mocks/mockedModules';
import UpdateUserInputDto from '../dto/user/UpdateUserInput.dto';


export default class UpdateUserValidatorPipe implements PipeTransform<UpdateUserInputDto, IUpdateUser> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		const logger = new LoggerService(UpdateUserValidatorPipe.name, configServiceMock as ConfigService, dataParserHelperMock as DataParserHelper);
		this.schemaValidator = new SchemaValidator(new Exceptions(), logger);
	}

	public transform(value: UpdateUserInputDto, metadata: ArgumentMetadata): IUpdateUser {
		return this.schemaValidator.validate<IUpdateUser>(value, metadata, updateUserSchema);
	}
}
