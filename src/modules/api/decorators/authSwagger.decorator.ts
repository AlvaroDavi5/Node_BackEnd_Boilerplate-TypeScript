import {
	applyDecorators,
	BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException,
	ConflictException, InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse,
	ApiConflictResponse, ApiInternalServerErrorResponse, ApiServiceUnavailableResponse,
} from '@nestjs/swagger';


export default () =>
	applyDecorators(
		ApiBearerAuth('Authorization'),
		ApiBadRequestResponse({
			description: 'Invalid request format (body, query, params...).',
			// type: BadRequestException,
			schema: { example: new BadRequestException() }
		}),
		ApiUnauthorizedResponse({
			description: 'Token does not match or is invalid (Authorization).',
			// type: UnauthorizedException,
			schema: { example: new UnauthorizedException() },
		}),
		ApiForbiddenResponse({
			description: 'Operation not allowed due business rules.',
			// type: ForbiddenException,
			schema: { example: new ForbiddenException() },
		}),
		ApiNotFoundResponse({
			description: 'Resource not founded.',
			// type: NotFoundException,
			schema: { example: new NotFoundException() },
		}),
		ApiConflictResponse({
			description: 'Operation not allowed due conflicts.',
			// type: ConflictException,
			schema: { example: new ConflictException() },
		}),
		ApiServiceUnavailableResponse({
			description: 'Service temporarily unavailable.',
			// type: ServiceUnavailableException,
			schema: { example: new ServiceUnavailableException() },
		}),
		ApiInternalServerErrorResponse({
			description: 'Internal unhandled situation.',
			// type: InternalServerErrorException,
			schema: { example: new InternalServerErrorException() },
		}),
	);
