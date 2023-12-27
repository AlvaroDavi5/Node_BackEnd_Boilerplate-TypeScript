import { Module } from '@nestjs/common';
import UploadService from '@reports/services/Upload.service';


@Module({
	imports: [],
	controllers: [],
	providers: [
		UploadService,
	],
	exports: [],
})
export default class ReportsModule { }
