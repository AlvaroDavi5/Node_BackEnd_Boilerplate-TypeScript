import express, { Express } from 'express';
import entitiesRoutes from './entities/Router.js';


export default class Server {
	private express: Express;

	constructor() {
		this.express = express();
		this.express.use(entitiesRoutes);
		this.express.use('/*', (req, res, next) =>
			res.status(404).send('not found')
		);
	}

	start() {
		const serverPort = process.env.MOCKED_SERVERS_APP_PORT || 4001;

		return this.express.listen(serverPort, () => {
			console.log(
				`\nQUIQ_ENTITIES_SERVICE_REST_URL='http://localhost:${serverPort}/'`
			);
			console.log(
				`Mocked external servers listening at PORT: ${serverPort}\n`
			);
		});
	}
}
