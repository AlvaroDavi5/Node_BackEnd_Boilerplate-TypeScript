import { Module, Global } from '@nestjs/common';
import HttpConstants from '@common/constants/Http.constants';
import RequestRateConstants from '@common/constants/RequestRate.constants';
import ContentTypeConstants from '@common/constants/ContentType.constants';
import RegExConstants from '@common/constants/Regex.constants';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';


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
		DateGeneratorHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		HttpConstants,
		ContentTypeConstants,
		RequestRateConstants,
		RegExConstants,
		DataParserHelper,
		DateGeneratorHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
})
export default class CommonModule { }
