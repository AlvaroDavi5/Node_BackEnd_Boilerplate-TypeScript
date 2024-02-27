import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import registerEventHookSchema, { RegisterEventHookInterface } from '@api/schemas/registerEventHook.schema';
import { RegisterEventHookInputDto } from './dto/HookInput.dto';


export class RegisterEventHookPipeValidator implements PipeTransform<RegisterEventHookInputDto, RegisterEventHookInterface> {
	private readonly schemaValidator: SchemaValidator<RegisterEventHookInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<RegisterEventHookInterface>(new Exceptions());
	}

	public transform(value: RegisterEventHookInputDto, metadata: ArgumentMetadata): RegisterEventHookInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, registerEventHookSchema);
	}
}
