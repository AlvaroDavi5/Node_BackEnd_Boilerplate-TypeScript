import { Module, Global } from '@nestjs/common';
import DataParserHelper from '@modules/utils/helpers/DataParser.helper';
import CacheAccessHelper from '@modules/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@modules/utils/helpers/FileReader.helper';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper
	],
})
export default class UtilsModule { }
