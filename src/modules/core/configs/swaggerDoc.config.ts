import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import envsConfig from './envs.config';


const { package: { version: packageVersion, description: packageDescription } } = envsConfig();

export default (nestApp: INestApplication): void => {
	const apiDescription = packageDescription ? `${packageDescription} - API` : undefined;

	const config = new DocumentBuilder()
		.setTitle('Node Back-End Boilerplate')
		.setDescription(apiDescription ?? 'API Boilerplate created with Nest.js')
		.setVersion(packageVersion ?? '1.0.0')
		.setContact('Álvaro Alves', 'https://github.com/AlvaroDavi5', 'alvaro-davi1@hotmail.com')
		.addServer('http://localhost:3000', 'HTTP Main Server', {})
		.addServer('https://localhost:3000', 'HTTPS Main Server', {})
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
