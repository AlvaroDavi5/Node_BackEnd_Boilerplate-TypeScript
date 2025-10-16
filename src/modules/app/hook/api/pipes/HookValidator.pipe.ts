import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import registerEventHookSchema, { RegisterEventHookInterface } from '@app/hook/api/schemas/registerEventHook.schema';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock, dataParserHelperMock } from '@dev/mocks/mockedModules';


export default class RegisterEventHookValidatorPipe implements PipeTransform<RegisterEventHookInputDto, RegisterEventHookInterface> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		const logger = new LoggerService(SchemaValidator.name, configServiceMock as ConfigService, dataParserHelperMock as DataParserHelper);
		this.schemaValidator = new SchemaValidator(new Exceptions(), logger);
	}

	public transform(value: RegisterEventHookInputDto, metadata: ArgumentMetadata): RegisterEventHookInterface {
		return this.schemaValidator.validate<RegisterEventHookInterface>(value, metadata, registerEventHookSchema);
	}
}
