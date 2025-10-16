import express, { Express, json, urlencoded } from 'express';
import mockedServiceRoutes from './mockedService/router';


export default class Server {
	private expressServer: Express;

	constructor() {
		this.expressServer = express();
		this.expressServer.use(json()).use(urlencoded({ extended: true }));

		this.expressServer.use('/mockedService', mockedServiceRoutes);
		this.expressServer.use((_req, res, _next) => {
			res.status(404).send('not found');
		});
	}

	start() {
		const serverPort = process.env.MOCKED_SERVERS_APP_PORT || 4000;

		return this.expressServer.listen(serverPort, () => {
			console.log(
				`\nMOCKED_SERVERS_URL='http://localhost:${serverPort}/'`
			);
			console.log(
				`Mocked external servers listening at PORT: ${serverPort}\n`
			);
		});
	}
}
