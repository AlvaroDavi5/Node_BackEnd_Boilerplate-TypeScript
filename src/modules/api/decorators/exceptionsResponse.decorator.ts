import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse,
	ApiConflictResponse, ApiInternalServerErrorResponse, ApiServiceUnavailableResponse, ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import Exceptions from '@core/errors/Exceptions';


export default () => {
	const exceptions = new Exceptions();

	return applyDecorators(
		ApiBadRequestResponse({
			description: 'Invalid request format (body, query, params...).',
			schema: { example: exceptions.contract({ message: 'Error Message' }) }
		}),
		ApiUnauthorizedResponse({
			description: 'Operation not allowed to the userAgent (Authorization).',
			schema: { example: exceptions.unauthorized({ message: 'Error Message' }) },
		}),
		ApiForbiddenResponse({
			description: 'Operation not allowed due business rules.',
			schema: { example: exceptions.business({ message: 'Error Message' }) },
		}),
		ApiNotFoundResponse({
			description: 'Resource not founded.',
			schema: { example: exceptions.notFound({ message: 'Error Message' }) },
		}),
		ApiConflictResponse({
			description: 'Operation not allowed due conflicts.',
			schema: { example: exceptions.conflict({ message: 'Error Message' }) },
		}),
		ApiTooManyRequestsResponse({
			description: 'Multiple requests in short time.',
			schema: { example: exceptions.manyRequests({ message: 'Error Message' }) },
		}),
		ApiForbiddenResponse({
			description: 'Token does not match or is invalid.',
			schema: { example: exceptions.invalidToken({ message: 'Error Message' }) },
		}),
		ApiInternalServerErrorResponse({
			description: 'Internal unhandled situation.',
			schema: { example: exceptions.internal({ message: 'Error Message' }) },
		}),
		ApiServiceUnavailableResponse({
			description: 'Service temporarily unavailable.',
			schema: { example: exceptions.integration({ message: 'Error Message' }) },
		}),
	);
};
