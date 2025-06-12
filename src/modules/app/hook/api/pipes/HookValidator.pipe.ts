import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';
import registerEventHookSchema, { RegisterEventHookInterface } from '@app/hook/api/schemas/registerEventHook.schema';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';


export default class RegisterEventHookValidatorPipe implements PipeTransform<RegisterEventHookInputDto, RegisterEventHookInterface> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		this.schemaValidator = new SchemaValidator(new Exceptions(), generateLogger(RegisterEventHookValidatorPipe.name));
	}

	public transform(value: RegisterEventHookInputDto, metadata: ArgumentMetadata): RegisterEventHookInterface {
		return this.schemaValidator.validate<RegisterEventHookInterface>(value, metadata, registerEventHookSchema);
	}
}
