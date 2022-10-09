import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { scopePerRequest } from 'awilix-express';
import { containerInterface, containerType } from 'src/types/_containerInterface';
dotenv.config();


export default class RestServer {
	logger: containerType;
	express: containerType;
	router: containerType;

	/**
	 @param {Object} ctx - Dependency Injection (container)
	 @param {import('src/infra/logging/logger')} ctx.logger
	 @param {import('src/interface/api/http/routers/router')} ctx.router
	 @param {import('src/container')} ctx.container
	**/
	constructor({ logger, router, container }: containerInterface) {
		this.logger = logger;
		this.express = express();
		this.express.use(scopePerRequest(container));

		if (process.env.NODE_ENV !== 'test') {
			this.express.use(cors());
			this.express.use(morgan('combined', { stream: this.logger.stream }));
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
