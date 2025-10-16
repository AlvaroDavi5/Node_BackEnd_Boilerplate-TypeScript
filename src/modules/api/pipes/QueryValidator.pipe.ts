import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import listQuerySchema from '@api/schemas/listQuery.schema';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock, dataParserHelperMock } from '@dev/mocks/mockedModules';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ListQueryInputDto } from '../dto/QueryInput.dto';


export default class ListQueryValidatorPipe implements PipeTransform<ListQueryInputDto, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		const logger = new LoggerService(ListQueryValidatorPipe.name, configServiceMock as ConfigService, dataParserHelperMock as DataParserHelper);
		this.schemaValidator = new SchemaValidator(new Exceptions(), logger);
	}

	public transform(value: ListQueryInputDto, metadata: ArgumentMetadata): ListQueryInterface {
		return this.schemaValidator.validate<ListQueryInterface>(value, metadata, listQuerySchema);
	}
}
