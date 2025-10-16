import { Module, Global } from '@nestjs/common';
import HttpMessagesConstants from './constants/HttpMessages.constants';
import RequestRateLimitConstants from './constants/RequestRateLimit.constants';
import ContentTypeConstants from './constants/ContentType.constants';
import RegExConstants from './constants/Regex.constants';
import DataParserHelper from './utils/helpers/DataParser.helper';
import CacheAccessHelper from './utils/helpers/CacheAccess.helper';
import FileReaderHelper from './utils/helpers/FileReader.helper';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		HttpMessagesConstants,
		RequestRateLimitConstants,
		ContentTypeConstants,
		RegExConstants,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		HttpMessagesConstants,
		RequestRateLimitConstants,
		ContentTypeConstants,
		RegExConstants,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
})
export default class CommonModule { }
