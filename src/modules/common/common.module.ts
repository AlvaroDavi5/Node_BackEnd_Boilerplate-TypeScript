import { Module, Global } from '@nestjs/common';
import HttpConstants from './constants/Http.constants';
import RequestRateConstants from './constants/RequestRate.constants';
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
		HttpConstants,
		ContentTypeConstants,
		RequestRateConstants,
		RegExConstants,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		HttpConstants,
		ContentTypeConstants,
		RequestRateConstants,
		RegExConstants,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
})
export default class CommonModule { }
