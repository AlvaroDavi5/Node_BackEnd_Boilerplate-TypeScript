import { PipeTransform } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import configs from '@core/configs/configs.config';
import listQuerySchema from '../schemas/listQuery.schema';
import { ListQueryInterface } from 'src/types/_listPaginationInterface';


export class ListQueryValidatorPipe implements PipeTransform<any, ListQueryInterface> {
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

	public transform(data: any): ListQueryInterface {
		return this.schemaValidator.validate(data, listQuerySchema);
	}
}
