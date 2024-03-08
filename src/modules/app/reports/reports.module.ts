import { Module } from '@nestjs/common';
import UploadService from '@app/reports/services/Upload.service';


@Module({
	imports: [],
	controllers: [],
	providers: [
		UploadService,
	],
	exports: [],
})
export default class ReportsModule { }
