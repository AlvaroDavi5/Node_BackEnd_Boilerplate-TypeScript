import {
	Controller, Res,
	Put, Query,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import HttpConstants from '@common/constants/Http.constants';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import { RegisterEventHookPipeValidator } from '@app/hook/api/pipes/HookValidator.pipe';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import WebhookService from '@app/hook/services/Webhook.service';


@ApiTags('Webhooks')
@Controller('/hook')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class HookController {
	constructor(
		private readonly httpConstants: HttpConstants,
		private readonly webHookService: WebhookService,
	) { }

	@ApiOperation({
		summary: 'Register Event Hook',
		description: 'Create a new event register for hook',
		deprecated: false,
	})
	@Put('/')
	@ApiOkResponse({
		schema: {
			example: {
				statusMessage: 'Event hook register created successfully.',
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async registerEventHook(
		@Query(RegisterEventHookPipeValidator) query: RegisterEventHookInputDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ statusMessage: string }> {
		if (query.responseSchema)
			await this.webHookService.save(query.responseSchema, query);

		return {
			statusMessage: response.statusMessage ?? this.httpConstants.messages.created('Hook event register'),
		};
	}
}
