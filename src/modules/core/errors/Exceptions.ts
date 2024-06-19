import {
	Injectable, HttpException, HttpExceptionOptions,
	BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException,
	ConflictException, InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import HttpConstants from '@common/constants/Http.constants';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


@Injectable()
export default class Exceptions {
	private readonly httpConstants: HttpConstants = new HttpConstants();

	private parseToString(value?: unknown): string | undefined {
		if (value === undefined || value === null || typeof value === 'function')
			return undefined;
		else if (typeof value === 'object')
			return JSON.stringify(value) || value.toString();
		else if (typeof value === 'string')
			return value;
		else
			return value.toString();
	}

	private buildException(exceptionName: string, statusCode: number, errorName: string, errorMessage: string, errorDetails: unknown, errorCause?: unknown, errorStack?: string): HttpException {
		const errorPayload: string | Record<string, any> = {
			error: errorName,
			message: errorMessage,
			statusCode,
			details: this.parseToString(errorDetails),
		};
		const detailsPayload: HttpExceptionOptions = {
			description: this.parseToString(errorDetails),
			cause: this.parseToString(errorCause),
		};

		const exception = new HttpException(errorPayload, statusCode, detailsPayload);
		exception.name = exceptionName;
		exception.message = errorMessage;
		exception.cause = errorDetails;
		if (errorStack) exception.stack = errorStack;

		return exception;
	}

	public [ExceptionsEnum.CONTRACT](error: ErrorInterface): BadRequestException {
		return this.buildException(
			ExceptionsEnum.CONTRACT,
			this.httpConstants.status.BAD_REQUEST,
			error.name ?? 'Bad Request',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.BUSINESS](error: ErrorInterface): ForbiddenException {
		return this.buildException(
			ExceptionsEnum.BUSINESS,
			this.httpConstants.status.FORBIDDEN,
			error.name ?? 'Forbidden',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.UNAUTHORIZED](error: ErrorInterface): UnauthorizedException {
		return this.buildException(
			ExceptionsEnum.UNAUTHORIZED,
			this.httpConstants.status.UNAUTHORIZED,
			error.name ?? 'Unauthorized',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.TOO_MANY_REQUESTS](error: ErrorInterface): ThrottlerException {
		return this.buildException(
			ExceptionsEnum.TOO_MANY_REQUESTS,
			this.httpConstants.status.TOO_MANY_REQUESTS,
			error.name ?? 'Too Many Requests',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.CONFLICT](error: ErrorInterface): ConflictException {
		return this.buildException(
			ExceptionsEnum.CONFLICT,
			this.httpConstants.status.CONFLICT,
			error.name ?? 'Conflict',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.NOT_FOUND](error: ErrorInterface): NotFoundException {
		return this.buildException(
			ExceptionsEnum.NOT_FOUND,
			this.httpConstants.status.NOT_FOUND,
			error.name ?? 'Not Found',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INTEGRATION](error: ErrorInterface): ServiceUnavailableException {
		return this.buildException(
			ExceptionsEnum.INTEGRATION,
			this.httpConstants.status.SERVICE_UNAVAILABLE,
			error.name ?? 'Service Unavailable',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INTERNAL](error: ErrorInterface): InternalServerErrorException {
		return this.buildException(
			ExceptionsEnum.INTERNAL,
			this.httpConstants.status.INTERNAL_SERVER_ERROR,
			error.name ?? 'Internal Server Error',
			error.message, error.details, error.cause, error.stack,
		);
	}
}
