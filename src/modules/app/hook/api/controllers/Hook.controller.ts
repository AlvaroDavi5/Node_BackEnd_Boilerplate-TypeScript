import {
	Inject,
	Controller, Res,
	Put, Query,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import WebhookService from '@app/hook/services/Webhook.service';
import { RegisterEventHookValidatorPipe } from '@app/hook/api/pipes/HookValidator.pipe';
import { RegisterEventHookInputDto } from '@app/hook/api/dto/HookInput.dto';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import HttpConstants from '@common/constants/Http.constants';


@ApiTags('Webhooks')
@Controller('/hook')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class HookController {
	constructor(
		private readonly httpConstants: HttpConstants,
		private readonly webHookService: WebhookService,
		@Inject(REQUEST_LOGGER_PROVIDER)
		private readonly logger: LoggerService,
	) {
		this.logger.setContextName(HookController.name);
	}

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
		@Query(RegisterEventHookValidatorPipe) query: RegisterEventHookInputDto,
		@Res({ passthrough: true }) response: Response,
	): Promise<{ statusMessage: string }> {
		try {
			if (query.responseSchema.length) {
				await this.webHookService.save(query.responseSchema, query);

				return {
					statusMessage: response.statusMessage ?? this.httpConstants.messages.created('Hook event register'),
				};
			} else {
				response.status(this.httpConstants.status.CONFLICT);
				return {
					statusMessage: response.statusMessage ?? this.httpConstants.messages.notCreated('Hook event register'),
				};
			}
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
