import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import readPackageInfo from '@common/utils/packageInfoReader.util';


export default (nestApp: INestApplication<any>): void => {
	const { description, version } = readPackageInfo();
	const apiDescription = description ? `${description} - API` : undefined;

	const config = new DocumentBuilder()
		.setTitle('Node Back-End Boilerplate')
		.setDescription(apiDescription ?? 'API Boilerplate created with Nest.js')
		.setVersion(version ?? '1.0.0')
		.setContact('Álvaro Alves', 'https://github.com/AlvaroDavi5', 'alvaro.davisa@gmail.com')
		.addServer('http://localhost:3000', 'Main Server', {})
		.addServer('http://localhost:4000', 'Mocked Server', {})
		.addBearerAuth({
			type: 'http',
			scheme: 'bearer',
			in: 'header',
			bearerFormat: 'JWT',
			name: 'JWT',
			description: 'Enter JWT token',
		}, 'Authorization')
		.build();

	const document = SwaggerModule.createDocument(nestApp, config, {
		ignoreGlobalPrefix: false,
	});

	SwaggerModule.setup('/api/docs', nestApp, document, {
		customSiteTitle: 'Boilerplate API',
		swaggerOptions: {
			docExpansion: 'none',
		},
		jsonDocumentUrl: '/api/docs.json',
		yamlDocumentUrl: '/api/docs.yml',
	});
};
