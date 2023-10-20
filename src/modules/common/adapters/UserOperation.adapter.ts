import { Injectable } from '@nestjs/common';
import UserOperation from '@app/operations/User.operation';


@Injectable()
export default class UserOperationAdapter {
	constructor(
		private readonly userOperation: UserOperation,
	) { }

	public getProvider(): UserOperation {
		return this.userOperation;
	}
}
