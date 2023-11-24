import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsString, IsNumberString, IsBooleanString } from 'class-validator';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import configs from '@core/configs/configs.config';
import listQuerySchema from '@api/schemas/listQuery.schema';
import { ListQueryInterface } from 'src/types/_listPaginationInterface';


export abstract class ListQueryPipeModel implements ListQueryInterface {
	@ApiProperty({ type: Number, example: 5, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsNumberString()
	public limit: number | undefined = undefined;

	@ApiProperty({ type: Number, example: 1, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsNumberString()
	public page: number | undefined = undefined;

	@ApiProperty({ type: String, example: 'ASC', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public order: 'ASC' | 'DESC' | undefined = undefined;

	@ApiProperty({ type: String, example: 'createdAt', default: undefined, nullable: true, required: false })
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

export class ListQueryPipeValidator implements PipeTransform<ListQueryPipeModel, ListQueryInterface> {
	private readonly schemaValidator: SchemaValidator<ListQueryInterface>;

	constructor() {
		const appConfigs: any = configs();
		const configServiceMock: any = {
			get: (propertyPath?: string) => {
				if (propertyPath)
					return appConfigs[propertyPath];
				else
					return appConfigs;
			},
		};

		this.schemaValidator = new SchemaValidator<ListQueryInterface>(new Exceptions(configServiceMock));
	}

	public transform(value: ListQueryPipeModel, metadata: ArgumentMetadata): ListQueryInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, listQuerySchema);
	}
}
