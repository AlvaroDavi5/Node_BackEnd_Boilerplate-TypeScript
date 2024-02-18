import {
	Controller, Res,
	Put, Query,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import HttpConstants from '@api/constants/Http.constants';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import { RegisterHookEventPipeValidator } from '@api/pipes/HookValidator.pipe';
import { RegisterHookEventInputDto } from '@api/pipes/dto/HookInput.dto';
import WebhookService from '@app/services/Webhook.service';


@Controller()
@UseGuards(CustomThrottlerGuard)
export default class HookController {
	constructor(
		private readonly httpConstants: HttpConstants,
		private readonly webHookService: WebhookService,
	) { }

	@ApiTags('Webhook')
	@ApiOperation({ summary: 'Register Hook Event' })
	@Put('/hook')
	@ApiOkResponse({
		schema: {
			example: {
				statusMessage: 'Hook event register created successfully.',
			},
		}
	})
	@exceptionsResponseDecorator()
	@authSwaggerDecorator()
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async registerHookEvent(
		@Query(RegisterHookEventPipeValidator) query: RegisterHookEventInputDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ statusMessage: string }> {
		if (query.responseSchema)
			await this.webHookService.save(query.responseSchema, query);

		return {
			statusMessage: response.statusMessage ?? this.httpConstants.messages.created('Hook event register'),
		};
	}
}
