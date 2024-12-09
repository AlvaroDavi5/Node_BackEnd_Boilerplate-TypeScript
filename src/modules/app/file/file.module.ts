import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestMiddleware from '@api/middlewares/Request.middleware';
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
export default class FileModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestMiddleware)
			.forRoutes(
				FileController,
			);
	}
}
