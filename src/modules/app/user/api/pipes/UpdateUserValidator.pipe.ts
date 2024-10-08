import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';
import updateUserSchema from '@app/user/api/schemas/user/updateUser.schema';
import { IUpdateUser } from '@domain/entities/User.entity';
import UpdateUserInputDto from '../dto/user/UpdateUserInput.dto';


export default class UpdateUserValidatorPipe implements PipeTransform<UpdateUserInputDto, IUpdateUser> {
	private readonly schemaValidator: SchemaValidator;

	constructor() {
		this.schemaValidator = new SchemaValidator(new Exceptions(), generateLogger(UpdateUserValidatorPipe.name));
	}

	public transform(value: UpdateUserInputDto, metadata: ArgumentMetadata): IUpdateUser {
		return this.schemaValidator.validate<IUpdateUser>(value, metadata, updateUserSchema);
	}
}
