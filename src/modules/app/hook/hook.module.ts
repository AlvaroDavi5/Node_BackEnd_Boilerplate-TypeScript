import { Module } from '@nestjs/common';
import HookController from './api/controllers/Hook.controller';
import WebhookService from './services/Webhook.service';


@Module({
	imports: [],
	controllers: [
		HookController,
	],
	providers: [
		WebhookService,
	],
	exports: [
		WebhookService,
	],
})
export default class HookModule { }
