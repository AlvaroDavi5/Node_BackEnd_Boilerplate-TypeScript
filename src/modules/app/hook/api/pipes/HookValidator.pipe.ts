import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import registerEventHookSchema, { RegisterEventHookInterface } from '@app/hook/api/schemas/registerEventHook.schema';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import { generateLogger } from '@core/logging/logger';


export class RegisterEventHookValidatorPipe implements PipeTransform<RegisterEventHookInputDto, RegisterEventHookInterface> {
	private readonly schemaValidator: SchemaValidator<RegisterEventHookInterface>;

	constructor() {
		this.schemaValidator = new SchemaValidator<RegisterEventHookInterface>(new Exceptions(), generateLogger(RegisterEventHookValidatorPipe.name));
	}

	public transform(value: RegisterEventHookInputDto, metadata: ArgumentMetadata): RegisterEventHookInterface {
		return this.schemaValidator.validate(value, metadata, registerEventHookSchema);
	}
}
