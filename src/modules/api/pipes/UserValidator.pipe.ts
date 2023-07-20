import {
	PipeTransform,
	BadRequestException,
} from '@nestjs/common';
import createUserSchema from '../schemas/user/createUser.schema';
import updateUserSchema from '../schemas/user/updateUser.schema';


export class CreateUserValidatorPipe implements PipeTransform<any> {
	public transform(value: any): any {
		const result = createUserSchema.validate(value);
		console.log(result);
		if (result.error) {
			const errorMessages = result.error.details.map((d) => d.message).join();
			throw new BadRequestException(errorMessages);
		}
		return value;
	}
}

export class UpdateUserValidatorPipe implements PipeTransform<any> {
	public transform(value: any): any {
		const result = updateUserSchema.validate(value);
		console.log(result);
		if (result.error) {
			const errorMessages = result.error.details.map((d) => d.message).join();
			throw new BadRequestException(errorMessages);
		}
		return value;
	}
}
