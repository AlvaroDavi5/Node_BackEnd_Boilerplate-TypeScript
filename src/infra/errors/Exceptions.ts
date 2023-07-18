import {
	Injectable,
	BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException,
	ConflictException, InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@configs/configs';
import { ExceptionsEnum } from './exceptionsEnum';
import { ErrorInterface } from 'src/types/_errorInterface';


@Injectable()
export default class Exceptions {
	constructor(
		private readonly configService: ConfigService,
	) { }

	private showStack(): boolean {
		const stackErrorVisible: ConfigsInterface['application']['stackErrorVisible'] = this.configService.get<any>('application.stackErrorVisible');
		if (stackErrorVisible === 'true')
			return true;
		return false;
	}

	public [ExceptionsEnum.CONTRACT](msg: ErrorInterface) {
		const exception = new BadRequestException(msg.message);

		exception.name = ExceptionsEnum.CONTRACT;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}

	public [ExceptionsEnum.BUSINESS](msg: ErrorInterface) {
		const exception = new ForbiddenException(msg.message);

		exception.name = ExceptionsEnum.BUSINESS;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}

	public [ExceptionsEnum.UNAUTHORIZED](msg: ErrorInterface) {
		const exception = new UnauthorizedException(msg.message);

		exception.name = ExceptionsEnum.UNAUTHORIZED;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}

	public [ExceptionsEnum.CONFLICT](msg: ErrorInterface) {
		const exception = new ConflictException(msg.message);

		exception.name = ExceptionsEnum.CONFLICT;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}

	public [ExceptionsEnum.NOT_FOUND](msg: ErrorInterface) {
		const exception = new NotFoundException(msg.message);

		exception.name = ExceptionsEnum.NOT_FOUND;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}

	public [ExceptionsEnum.INTEGRATION](msg: ErrorInterface) {
		const exception = new ServiceUnavailableException(msg.message);

		exception.name = ExceptionsEnum.INTEGRATION;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}

	public [ExceptionsEnum.INTERNAL](msg: ErrorInterface) {
		const exception = new InternalServerErrorException(msg.message);

		exception.name = ExceptionsEnum.INTERNAL;
		exception.message = msg.message;
		exception.cause = msg.details;
		if (this.showStack())
			exception.stack = msg.stack;

		return exception;
	}
}
