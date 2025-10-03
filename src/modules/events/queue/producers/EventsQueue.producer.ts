import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import LoggerService from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import AbstractQueueProducer from './AbstractProducer.producer';


@Injectable()
export default class EventsQueueProducer extends AbstractQueueProducer {
	constructor(
		configService: ConfigService,
		dataParserHelper: DataParserHelper,
		cryptographyService: CryptographyService,
		sqsClient: SqsClient,
		logger: LoggerService,
	) {
		super(
			EventsQueueProducer.name,
			'eventsQueue',
			configService,
			dataParserHelper,
			cryptographyService,
			sqsClient,
			logger,
		);
	}
}
