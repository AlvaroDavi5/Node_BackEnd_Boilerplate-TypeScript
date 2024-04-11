import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse,
	ApiConflictResponse, ApiInternalServerErrorResponse, ApiServiceUnavailableResponse, ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import Exceptions from '@core/infra/errors/Exceptions';


export default () => {
	const exceptions = new Exceptions();

	return applyDecorators(
		ApiBadRequestResponse({
			description: 'Invalid request format (body, query, params...).',
			// type: BadRequestException,
			schema: { example: exceptions.contract({ message: 'Error Message' }) }
		}),
		ApiUnauthorizedResponse({
			description: 'Token does not match or is invalid (Authorization).',
			// type: UnauthorizedException,
			schema: { example: exceptions.unauthorized({ message: 'Error Message' }) },
		}),
		ApiTooManyRequestsResponse({
			description: 'Multiple requests in short time.',
			// type: ThrottlerException,
			schema: { example: exceptions.manyRequests({ message: 'Error Message' }) },
		}),
		ApiForbiddenResponse({
			description: 'Operation not allowed due business rules.',
			// type: ForbiddenException,
			schema: { example: exceptions.business({ message: 'Error Message' }) },
		}),
		ApiNotFoundResponse({
			description: 'Resource not founded.',
			// type: NotFoundException,
			schema: { example: exceptions.notFound({ message: 'Error Message' }) },
		}),
		ApiConflictResponse({
			description: 'Operation not allowed due conflicts.',
			// type: ConflictException,
			schema: { example: exceptions.conflict({ message: 'Error Message' }) },
		}),
		ApiServiceUnavailableResponse({
			description: 'Service temporarily unavailable.',
			// type: ServiceUnavailableException,
			schema: { example: exceptions.integration({ message: 'Error Message' }) },
		}),
		ApiInternalServerErrorResponse({
			description: 'Internal unhandled situation.',
			// type: InternalServerErrorException,
			schema: { example: exceptions.internal({ message: 'Error Message' }) },
		}),
	);
};
