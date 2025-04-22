import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import LoggerService from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import AbstractQueueProducer from './AbstractProducer.producer';


@Injectable()
export default class EventsQueueProducer extends AbstractQueueProducer {
	constructor(
		configService: ConfigService,
		cryptographyService: CryptographyService,
		sqsClient: SqsClient,
		logger: LoggerService,
	) {
		super(
			EventsQueueProducer.name,
			'eventsQueue',
			configService,
			cryptographyService,
			sqsClient,
			logger,
		);
	}
}
