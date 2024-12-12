import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse,
	ApiConflictResponse, ApiInternalServerErrorResponse, ApiServiceUnavailableResponse, ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import Exceptions from '@core/errors/Exceptions';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';


export default () => {
	const exceptions = new Exceptions();
	const error = { message: 'Error Message', code: 'ERR', details: [], cause: '', stack: '' };
	const errorDescription = 'Unknown Error';
	const timestamp = '2024-10-11T00:01:49.996Z';

	const buildErrorResponse = (exceptionType: ExceptionsEnum) => {
		const response = exceptions[String(exceptionType) as ExceptionsEnum](error).getResponse() as object;

		return {
			...response,
			description: errorDescription,
			timestamp,
		};
	};

	return applyDecorators(
		ApiBadRequestResponse({
			description: 'Invalid request format (body, query, params...).',
			schema: { example: buildErrorResponse(ExceptionsEnum.CONTRACT) },
		}),
		ApiUnauthorizedResponse({
			description: 'Operation not allowed to the agentUser (Authorization).',
			schema: { example: buildErrorResponse(ExceptionsEnum.UNAUTHORIZED) },
		}),
		ApiForbiddenResponse({
			description: 'Operation not allowed due business rules.',
			schema: { example: buildErrorResponse(ExceptionsEnum.BUSINESS) },
		}),
		ApiNotFoundResponse({
			description: 'Resource not founded.',
			schema: { example: buildErrorResponse(ExceptionsEnum.NOT_FOUND) },
		}),
		ApiConflictResponse({
			description: 'Operation not allowed due conflicts.',
			schema: { example: buildErrorResponse(ExceptionsEnum.CONFLICT) },
		}),
		ApiTooManyRequestsResponse({
			description: 'Multiple requests in short time.',
			schema: { example: buildErrorResponse(ExceptionsEnum.TOO_MANY_REQUESTS) },
		}),
		ApiForbiddenResponse({
			description: 'Token does not match or is invalid.',
			schema: { example: buildErrorResponse(ExceptionsEnum.INVALID_TOKEN) },
		}),
		ApiInternalServerErrorResponse({
			description: 'Internal unhandled situation.',
			schema: { example: buildErrorResponse(ExceptionsEnum.INTERNAL) },
		}),
		ApiServiceUnavailableResponse({
			description: 'Service temporarily unavailable.',
			schema: { example: buildErrorResponse(ExceptionsEnum.INTEGRATION) },
		}),
	);
};
