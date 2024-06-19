import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import listQuerySchema from '@api/schemas/listQuery.schema';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ListQueryInputDto } from './dto/QueryInput.dto';
import { generateLogger } from '@core/logging/logger';


export class ListQueryValidatorPipe implements PipeTransform<ListQueryInputDto, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator<ListQueryInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<ListQueryInterface>(new Exceptions(), generateLogger(ListQueryValidatorPipe.name));
	}

	public transform(value: ListQueryInputDto, metadata: ArgumentMetadata): ListQueryInterface {
		return this.schemaValidator.validate(value, metadata, listQuerySchema);
	}
}
