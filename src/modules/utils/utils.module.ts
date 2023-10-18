import { Module, Global } from '@nestjs/common';
import SchemaValidator from '@modules/utils/common/validators/SchemaValidator.validator';
import DataParserHelper from '@modules/utils/helpers/DataParser.helper';
import CacheAccessHelper from '@modules/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@modules/utils/helpers/FileReader.helper';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper
	],
})
export default class UtilsModule { }
