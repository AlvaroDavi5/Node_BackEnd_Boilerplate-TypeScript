import {
	Controller, Res,
	Put, Query,
	UseGuards, UseFilters, UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiCreatedResponse, ApiNotAcceptableResponse } from '@nestjs/swagger';
import { Response } from 'express';
import WebhookService from '@app/hook/services/Webhook.service';
import { RegisterEventHookValidatorPipe } from '@app/hook/api/pipes/HookValidator.pipe';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import AuthGuard from '@api/guards/Auth.guard';
import { HttpExceptionsFilter } from '@api/filters/HttpExceptions.filter';
import ResponseInterceptor from '@api/interceptors/Response.interceptor';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import HttpMessagesConstants from '@common/constants/HttpMessages.constants';


@ApiTags('Webhooks')
@Controller('/hook')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@UseFilters(HttpExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class HookController {
	constructor(
		private readonly httpMessagesConstants: HttpMessagesConstants,
		private readonly webHookService: WebhookService,
	) { }

	@ApiOperation({
		summary: 'Register Event Hook',
		description: 'Create a new event register for hook',
		deprecated: false,
	})
	@Put('/')
	@ApiCreatedResponse({
		schema: {
			example: {
				statusMessage: 'Hook event register created successfully.',
			},
		}
	})
	@ApiNotAcceptableResponse({
		schema: {
			example: {
				statusMessage: 'Hook event register is not acceptable!',
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async registerEventHook(
		@Query(RegisterEventHookValidatorPipe) query: RegisterEventHookInputDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ statusMessage: string }> {
		const resourceName = 'Hook event register';

		if (query.responseSchema.length) {
			await this.webHookService.save(query.responseSchema, query);

			response.status(HttpStatusEnum.CREATED);
			return {
				statusMessage: response.statusMessage ?? this.httpMessagesConstants.messages.created(resourceName),
			};
		} else {
			response.status(HttpStatusEnum.NOT_ACCEPTABLE);
			return {
				statusMessage: response.statusMessage ?? this.httpMessagesConstants.messages.notAcceptable(resourceName),
			};
		}
	}
}
