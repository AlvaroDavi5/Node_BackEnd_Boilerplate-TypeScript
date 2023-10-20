import { Module, Global } from '@nestjs/common';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';
import UserOperationAdapter from '@common/adapters/UserOperation.adapter';
import SubscriptionServiceAdapter from '@common/adapters/SubscriptionService.adapter';
import EventsQueueProducerAdapter from '@common/adapters/EventsQueueProducer.adapter';
import WebSocketServerAdapter from '@common/adapters/WebSocketServer.adapter';
import WebSocketClientAdapter from '@common/adapters/WebSocketClient.adapter';
import AppModule from '@app/app.module';
import EventsModule from '@events/events.module';


@Global()
@Module({
	imports: [
		AppModule,
		EventsModule,
	],
	controllers: [],
	providers: [
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
		UserOperationAdapter,
		SubscriptionServiceAdapter,
		EventsQueueProducerAdapter,
		WebSocketServerAdapter,
		WebSocketClientAdapter,
	],
	exports: [
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
		UserOperationAdapter,
		SubscriptionServiceAdapter,
		EventsQueueProducerAdapter,
		WebSocketServerAdapter,
		WebSocketClientAdapter,
	],
})
export default class CommonModule { }
