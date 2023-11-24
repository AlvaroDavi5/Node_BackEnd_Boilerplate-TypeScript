import {
	Injectable,
	BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException,
	ConflictException, InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import { ExceptionsEnum } from './exceptions.enum';
import { ErrorInterface } from 'src/types/_errorInterface';


@Injectable()
export default class Exceptions {
	private readonly showStack: boolean = false;

	constructor(
		private readonly configService: ConfigService,
	) {
		const stackErrorVisible: ConfigsInterface['application']['stackErrorVisible'] = this.configService.get<any>('application.stackErrorVisible');
		this.showStack = (stackErrorVisible === 'true');
	}

	public [ExceptionsEnum.CONTRACT](error: ErrorInterface) {
		const exception = new BadRequestException(error.message);

		exception.name = ExceptionsEnum.CONTRACT;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}

	public [ExceptionsEnum.BUSINESS](error: ErrorInterface) {
		const exception = new ForbiddenException(error.message);

		exception.name = ExceptionsEnum.BUSINESS;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}

	public [ExceptionsEnum.UNAUTHORIZED](error: ErrorInterface) {
		const exception = new UnauthorizedException(error.message);

		exception.name = ExceptionsEnum.UNAUTHORIZED;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}

	public [ExceptionsEnum.CONFLICT](error: ErrorInterface) {
		const exception = new ConflictException(error.message);

		exception.name = ExceptionsEnum.CONFLICT;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}

	public [ExceptionsEnum.NOT_FOUND](error: ErrorInterface) {
		const exception = new NotFoundException(error.message);

		exception.name = ExceptionsEnum.NOT_FOUND;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}

	public [ExceptionsEnum.INTEGRATION](error: ErrorInterface) {
		const exception = new ServiceUnavailableException(error.message);

		exception.name = ExceptionsEnum.INTEGRATION;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}

	public [ExceptionsEnum.INTERNAL](error: ErrorInterface) {
		const exception = new InternalServerErrorException(error.message);

		exception.name = ExceptionsEnum.INTERNAL;
		exception.message = error.message;
		exception.cause = error.details;
		if (this.showStack)
			exception.stack = error.stack;

		return exception;
	}
}
