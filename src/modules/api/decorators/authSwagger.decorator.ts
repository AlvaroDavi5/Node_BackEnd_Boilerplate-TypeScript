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
			type: BadRequestException,
		}),
		ApiUnauthorizedResponse({
			description: 'Token does not match or is invalid (Authorization).',
			type: UnauthorizedException,
		}),
		ApiForbiddenResponse({
			description: 'Operation not allowed due business rules.',
			type: ForbiddenException,
		}),
		ApiNotFoundResponse({
			description: 'Resource not founded.',
			type: NotFoundException,
		}),
		ApiConflictResponse({
			description: 'Operation not allowed due conflicts.',
			type: ConflictException,
		}),
		ApiServiceUnavailableResponse({
			description: 'Service temporarily unavailable.',
			type: ServiceUnavailableException,
		}),
		ApiInternalServerErrorResponse({
			description: 'Internal unhandled situation.',
			type: InternalServerErrorException,
		}),
	);
