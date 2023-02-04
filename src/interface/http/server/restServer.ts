import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { scopePerRequest } from 'awilix-express';
import { ContainerInterface, genericType } from 'src/types/_containerInterface';


export default class RestServer {
	router: genericType;
	logger: genericType;
	loggerStream: genericType;
	configs: genericType;
	express: express.Express;

	/**
	@param {Object} ctx - Dependency Injection (container)
	@param {import('src/interface/http/routers/router')} ctx.router
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('src/infra/logging/logger')} ctx.loggerStream
	@param {import('configs/configs')} ctx.configs
	@param {import('src/container')} ctx.container
	**/
	constructor({
		router,
		logger,
		loggerStream,
		configs,
		container,
	}: ContainerInterface) {
		this.logger = logger;
		this.loggerStream = loggerStream;
		this.configs = configs;
		this.express = express();
		this.express.use(scopePerRequest(container));

		if (this.configs.application.environment !== 'test') {
			this.express.use(cors());
			this.express.use(morgan('combined', { stream: this.loggerStream }));
		}

		this.express.use(router);
	}

	exception() {
		this.express.use(async (error: Error | any, request: express.Request, response: express.Response, next: express.NextFunction) => {
			let title = 'Internal Server Error';
			if (error.name === 'Validation')
				title = 'Validation';
			return response.status(error.status || 500).json({ error: title, details: error?.message });
		});
	}

	get() {
		this.exception();

		return this.express;
	}
}
