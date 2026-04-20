import { Module } from '@nestjs/common';
import FileController from './api/controllers/File.controller';
import FileStrategy from './strategies/File.strategy';
import FileService from './services/File.service';


@Module({
	imports: [],
	controllers: [
		FileController,
	],
	providers: [
		FileService,
		FileStrategy,
	],
	exports: [
		FileStrategy,
	],
})
export default class FileModule { }
