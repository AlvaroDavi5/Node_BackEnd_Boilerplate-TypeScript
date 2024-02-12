import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import registerHookEventSchema, { RegisterHookEventInterface } from '@api/schemas/registerHookEvent.schema';
import { RegisterHookEventInputDto } from './dto/HookInput.dto';


export class RegisterHookEventPipeValidator implements PipeTransform<RegisterHookEventInputDto, RegisterHookEventInterface> {
	private readonly schemaValidator: SchemaValidator<RegisterHookEventInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<RegisterHookEventInterface>(new Exceptions());
	}

	public transform(value: RegisterHookEventInputDto, metadata: ArgumentMetadata): RegisterHookEventInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, registerHookEventSchema);
	}
}
