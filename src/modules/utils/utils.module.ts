import { Module, Global } from '@nestjs/common';
import DataParserHelper from '@modules/utils/helpers/DataParserHelper';
import CacheAccessHelper from '@modules/utils/helpers/CacheAccessHelper';
import FileReaderHelper from '@modules/utils/helpers/FileReaderHelper';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper
	],
	exports: [
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper
	],
})
export default class UtilsModule { }
