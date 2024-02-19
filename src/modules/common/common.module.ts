import { Module, Global } from '@nestjs/common';
import RegExConstants from '@common/constants/Regex.constants';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		RegExConstants,
		SchemaValidator,
		DataParserHelper,
		DateGeneratorHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		RegExConstants,
		SchemaValidator,
		DataParserHelper,
		DateGeneratorHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
})
export default class CommonModule { }
