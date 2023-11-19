import { Module, Global } from '@nestjs/common';
import RegExConstants from '@common/constants/Regex.constants';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';
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
		RegExConstants,
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
	exports: [
		RegExConstants,
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
	],
})
export default class CommonModule { }
