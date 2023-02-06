import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { scopePerRequest } from 'awilix-express';
import { LoggerStream } from 'src/infra/logging/logger';
import { ConfigsInterface } from 'configs/configs';
import { ContainerInterface } from 'src/container';


export default class RestServer {
	private express: express.Express;
	private loggerStream: LoggerStream;
	private configs: ConfigsInterface;

	constructor({
		router,
		loggerStream,
		configs,
		container,
	}: ContainerInterface) {
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
