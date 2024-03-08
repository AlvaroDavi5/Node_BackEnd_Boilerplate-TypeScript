import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import listQuerySchema from '@api/schemas/listQuery.schema';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';
import { ListQueryInputDto } from './dto/QueryInput.dto';


export class ListQueryPipeValidator implements PipeTransform<ListQueryInputDto, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator<ListQueryInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<ListQueryInterface>(new Exceptions());
	}

	public transform(value: ListQueryInputDto, metadata: ArgumentMetadata): ListQueryInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, listQuerySchema);
	}
}
