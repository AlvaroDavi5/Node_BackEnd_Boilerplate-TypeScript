import express, { Express } from 'express';
import mockedServiceRoutes from './mockedService/Router';


export default class Server {
	private express: Express;

	constructor() {
		this.express = express();
		this.express.use(mockedServiceRoutes);
		this.express.use('/*', (req, res, next) =>
			res.status(404).send('not found')
		);
	}

	start() {
		const serverPort = process.env.MOCKED_SERVERS_APP_PORT || 4000;

		return this.express.listen(serverPort, () => {
			console.log(
				`\nMOCKED_SERVERS_URL='http://localhost:${serverPort}/'`
			);
			console.log(
				`Mocked external servers listening at PORT: ${serverPort}\n`
			);
		});
	}
}
