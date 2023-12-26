import {
	Injectable,
	BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException,
	ConflictException, InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { ExceptionsEnum } from '../../../common/enums/exceptions.enum';
import { ErrorInterface } from 'src/types/_errorInterface';


@Injectable()
export default class Exceptions {

	public [ExceptionsEnum.CONTRACT](error: ErrorInterface): BadRequestException {
		const exception = new BadRequestException(error.message);

		exception.name = ExceptionsEnum.CONTRACT;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}

	public [ExceptionsEnum.BUSINESS](error: ErrorInterface): ForbiddenException {
		const exception = new ForbiddenException(error.message);

		exception.name = ExceptionsEnum.BUSINESS;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}

	public [ExceptionsEnum.UNAUTHORIZED](error: ErrorInterface): UnauthorizedException {
		const exception = new UnauthorizedException(error.message);

		exception.name = ExceptionsEnum.UNAUTHORIZED;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}

	public [ExceptionsEnum.CONFLICT](error: ErrorInterface): ConflictException {
		const exception = new ConflictException(error.message);

		exception.name = ExceptionsEnum.CONFLICT;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}

	public [ExceptionsEnum.NOT_FOUND](error: ErrorInterface): NotFoundException {
		const exception = new NotFoundException(error.message);

		exception.name = ExceptionsEnum.NOT_FOUND;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}

	public [ExceptionsEnum.INTEGRATION](error: ErrorInterface): ServiceUnavailableException {
		const exception = new ServiceUnavailableException(error.message);

		exception.name = ExceptionsEnum.INTEGRATION;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}

	public [ExceptionsEnum.INTERNAL](error: ErrorInterface): InternalServerErrorException {
		const exception = new InternalServerErrorException(error.message);

		exception.name = ExceptionsEnum.INTERNAL;
		exception.message = error.message;
		exception.cause = error.details || error.stack;

		return exception;
	}
}
