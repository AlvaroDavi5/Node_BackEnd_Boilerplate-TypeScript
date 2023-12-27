import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsString, IsNumberString, IsBooleanString } from 'class-validator';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import listQuerySchema from '@api/schemas/listQuery.schema';
import { ListQueryInterface } from 'src/types/_listPaginationInterface';


export abstract class ListQueryPipeDto implements ListQueryInterface {
	@ApiProperty({ type: Number, example: 5, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsNumberString()
	public limit: number | undefined = undefined;

	@ApiProperty({ type: Number, example: 1, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsNumberString()
	public page: number | undefined = undefined;

	@ApiProperty({ type: String, enum: ['ASC', 'DESC'], example: 'ASC', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public order: 'ASC' | 'DESC' | undefined = undefined;

	@ApiProperty({ type: String, enum: ['createdAt', 'updatedAt', 'deletedAt'], example: 'createdAt', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public sortBy: 'createdAt' | 'updatedAt' | 'deletedAt' | undefined = undefined;

	@ApiProperty({ type: String, example: 'My Name', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public searchTerm: string | undefined = undefined;

	@ApiProperty({ type: Boolean, example: true, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsBooleanString()
	public selectSoftDeleted: boolean | undefined = undefined;
}

export class ListQueryPipeValidator implements PipeTransform<ListQueryPipeDto, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator<ListQueryInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<ListQueryInterface>(new Exceptions());
	}

	public transform(value: ListQueryPipeDto, metadata: ArgumentMetadata): ListQueryInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, listQuerySchema);
	}
}
