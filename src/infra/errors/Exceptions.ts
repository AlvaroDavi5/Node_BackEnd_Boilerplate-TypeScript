import {
	Injectable,
	BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException,
	ConflictException, InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@configs/configs.config';
import { ExceptionsEnum } from './exceptions.enum';
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

	public [ExceptionsEnum.CONTRACT](err: ErrorInterface) {
		const exception = new BadRequestException(err.message);

		exception.name = ExceptionsEnum.CONTRACT;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}

	public [ExceptionsEnum.BUSINESS](err: ErrorInterface) {
		const exception = new ForbiddenException(err.message);

		exception.name = ExceptionsEnum.BUSINESS;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}

	public [ExceptionsEnum.UNAUTHORIZED](err: ErrorInterface) {
		const exception = new UnauthorizedException(err.message);

		exception.name = ExceptionsEnum.UNAUTHORIZED;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}

	public [ExceptionsEnum.CONFLICT](err: ErrorInterface) {
		const exception = new ConflictException(err.message);

		exception.name = ExceptionsEnum.CONFLICT;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}

	public [ExceptionsEnum.NOT_FOUND](err: ErrorInterface) {
		const exception = new NotFoundException(err.message);

		exception.name = ExceptionsEnum.NOT_FOUND;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}

	public [ExceptionsEnum.INTEGRATION](err: ErrorInterface) {
		const exception = new ServiceUnavailableException(err.message);

		exception.name = ExceptionsEnum.INTEGRATION;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}

	public [ExceptionsEnum.INTERNAL](err: ErrorInterface) {
		const exception = new InternalServerErrorException(err.message);

		exception.name = ExceptionsEnum.INTERNAL;
		exception.message = err.message;
		exception.cause = err.details;
		if (this.showStack())
			exception.stack = err.stack;

		return exception;
	}
}
