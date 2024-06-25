import { Injectable, HttpException, HttpExceptionOptions } from '@nestjs/common';
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
			description: this.parseToString(errorDetails),
			details: this.parseToString(errorDetails),
			cause: this.parseToString(errorCause),
		};
		const detailsPayload: HttpExceptionOptions = {
			description: this.parseToString(errorDetails),
			cause: errorCause,
		};

		const exception = new HttpException(errorPayload, statusCode, detailsPayload);
		exception.name = exceptionName;
		exception.message = errorMessage;
		exception.cause = errorDetails ?? errorCause;
		if (errorStack) exception.stack = errorStack;

		return exception;
	}

	public [ExceptionsEnum.CONTRACT](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.CONTRACT,
			this.httpConstants.status.BAD_REQUEST,
			error.name ?? 'Bad Request',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.BUSINESS](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.BUSINESS,
			this.httpConstants.status.FORBIDDEN,
			error.name ?? 'Forbidden',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INVALID_TOKEN](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.INVALID_TOKEN,
			this.httpConstants.status.INVALID_TOKEN,
			error.name ?? 'Invalid Token',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.UNAUTHORIZED](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.UNAUTHORIZED,
			this.httpConstants.status.UNAUTHORIZED,
			error.name ?? 'Unauthorized',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.TOO_MANY_REQUESTS](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.TOO_MANY_REQUESTS,
			this.httpConstants.status.TOO_MANY_REQUESTS,
			error.name ?? 'Too Many Requests',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.CONFLICT](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.CONFLICT,
			this.httpConstants.status.CONFLICT,
			error.name ?? 'Conflict',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.NOT_FOUND](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.NOT_FOUND,
			this.httpConstants.status.NOT_FOUND,
			error.name ?? 'Not Found',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INTEGRATION](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.INTEGRATION,
			this.httpConstants.status.SERVICE_UNAVAILABLE,
			error.name ?? 'Service Unavailable',
			error.message, error.details, error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INTERNAL](error: ErrorInterface): HttpException {
		return this.buildException(
			ExceptionsEnum.INTERNAL,
			this.httpConstants.status.INTERNAL_SERVER_ERROR,
			error.name ?? 'Internal Server Error',
			error.message, error.details, error.cause, error.stack,
		);
	}
}
