import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import LoggerMiddleware from '@api/middlewares/Logger.middleware';
import FileController from './api/controllers/File.controller';
import FileStrategy from './strategies/File.strategy';


@Module({
	imports: [],
	controllers: [
		FileController,
	],
	providers: [
		FileStrategy,
	],
	exports: [
		FileStrategy,
	],
})
export default class FileModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(
				FileController,
			);
	}
}
