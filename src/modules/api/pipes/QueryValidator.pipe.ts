import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';
import listQuerySchema from '@api/schemas/listQuery.schema';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ListQueryInputDto } from '../dto/QueryInput.dto';


export default class ListQueryValidatorPipe implements PipeTransform<ListQueryInputDto, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		this.schemaValidator = new SchemaValidator(new Exceptions(), generateLogger(ListQueryValidatorPipe.name));
	}

	public transform(value: ListQueryInputDto, metadata: ArgumentMetadata): ListQueryInterface {
		return this.schemaValidator.validate<ListQueryInterface>(value, metadata, listQuerySchema);
	}
}
