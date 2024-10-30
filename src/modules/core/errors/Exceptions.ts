import { Injectable, HttpException, HttpExceptionOptions } from '@nestjs/common';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


@Injectable()
export default class Exceptions {
	private parseToString(value?: unknown): string | undefined {
		if (isNullOrUndefined(value) || typeof value === 'function') return undefined;
		else if (typeof value === 'object') {
			try {
				return JSON.stringify(value);
			} catch (error) {
				return value?.toString();
			}
		} else if (typeof value === 'string') return value;
		else return value?.toString();
	}

	private buildException(
		exceptionName: ExceptionsEnum, statusCode: number, newException: boolean,
		errorName: string, errorMessage: string,
		errorDetails: unknown, errorCode?: string | number,
		errorCause?: unknown, errorStack?: string,
	): HttpException {
		const responsePayload: string | Record<string, unknown> = {
			error: errorName,
			message: errorMessage,
			statusCode,
			code: errorCode,
			description: this.parseToString(errorDetails ?? errorCode),
			details: this.parseToString(errorDetails),
			cause: this.parseToString(errorCause),
		};
		const errorOptions: HttpExceptionOptions = {
			description: this.parseToString(errorDetails),
			cause: errorCause,
		};

		const exception = new HttpException(responsePayload, statusCode, errorOptions);
		exception.name = newException ? errorName : exceptionName;
		exception.message = errorMessage;
		exception.cause = errorCause ?? errorDetails;
		if (errorStack) exception.stack = errorStack;

		return exception;
	}

	public [ExceptionsEnum.CONTRACT](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.CONTRACT, HttpStatusEnum.BAD_REQUEST, newException,
			error.name ?? 'Bad Request', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.BUSINESS](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.BUSINESS, HttpStatusEnum.FORBIDDEN, newException,
			error.name ?? 'Forbidden', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INVALID_TOKEN](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.INVALID_TOKEN, HttpStatusEnum.INVALID_TOKEN, newException,
			error.name ?? 'Invalid Token', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.UNAUTHORIZED](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.UNAUTHORIZED, HttpStatusEnum.UNAUTHORIZED, newException,
			error.name ?? 'Unauthorized', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.TOO_MANY_REQUESTS](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.TOO_MANY_REQUESTS, HttpStatusEnum.TOO_MANY_REQUESTS, newException,
			error.name ?? 'Too Many Requests', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.CONFLICT](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.CONFLICT, HttpStatusEnum.CONFLICT, newException,
			error.name ?? 'Conflict', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.NOT_FOUND](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.NOT_FOUND, HttpStatusEnum.NOT_FOUND, newException,
			error.name ?? 'Not Found', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INTEGRATION](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.INTEGRATION, HttpStatusEnum.SERVICE_UNAVAILABLE, newException,
			error.name ?? 'Service Unavailable', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}

	public [ExceptionsEnum.INTERNAL](error: ErrorInterface, newException = false): HttpException {
		return this.buildException(
			ExceptionsEnum.INTERNAL, HttpStatusEnum.INTERNAL_SERVER_ERROR, newException,
			error.name ?? 'Internal Server Error', error.message,
			error.details, error.code,
			error.cause, error.stack,
		);
	}
}
