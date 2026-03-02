import { ValidationPipe, VersioningType } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import fastifyMultipart from '@fastify/multipart';
import compression from 'compression';
import { getObjValues } from '@common/utils/dataValidations.util';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';


export const fastifyAdapter = new FastifyAdapter({
	bodyLimit: 10 * 1024 * 1024,
	routerOptions: {
		ignoreTrailingSlash: true,
		maxParamLength: 1000,
	},
	logger: false,
});

export default (nestApp: NestFastifyApplication): void => {
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

	nestApp.register(fastifyMultipart);
	nestApp.use(compression());
	nestApp.enableCors({
		origin: '*',
		allowedHeaders: '*',
		methods: getObjValues<HttpMethodsEnum>(HttpMethodsEnum),
	});
	nestApp.useWebSocketAdapter(new IoAdapter(nestApp)); // WsAdapter
};
