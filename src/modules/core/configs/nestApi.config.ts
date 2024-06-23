import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { json, urlencoded } from 'express';
import compression from 'compression';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';
import { getObjValues } from '@common/utils/dataValidations.util';


export default (nestApp: INestApplication): void => {
	nestApp.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: false,
			forbidNonWhitelisted: true,
			disableErrorMessages: false,
		}),
	);

	nestApp.setGlobalPrefix('api');
	nestApp.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '',
		prefix: '',
	});
	nestApp.use(json({ limit: '10mb' }));
	nestApp.use(urlencoded({ extended: true }));
	nestApp.use(compression());
	nestApp.enableCors({
		origin: '*',
		allowedHeaders: '*',
		methods: getObjValues<HttpMethodsEnum>(HttpMethodsEnum),
	});
	nestApp.useWebSocketAdapter(new IoAdapter(nestApp)); // WsAdapter
};
