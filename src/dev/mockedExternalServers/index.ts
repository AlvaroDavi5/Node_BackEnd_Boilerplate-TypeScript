import Fastify, { FastifyInstance } from 'fastify';
import formbody from '@fastify/formbody';
import mockedServiceRoutes from './mockedService/router';


export default class Server {
	private fastifyServer: FastifyInstance;

	constructor() {
		this.fastifyServer = Fastify({ logger: true });

		this.fastifyServer.register(formbody);

		this.fastifyServer.register(mockedServiceRoutes, { prefix: '/mockedService' });

		this.fastifyServer.setNotFoundHandler((_req, reply) => {
			reply.status(404).send('not found');
		});
	}

	async start() {
		const serverPort = Number(process.env.MOCKED_SERVERS_APP_PORT) || 4000;

		try {
			await this.fastifyServer.listen({ port: serverPort, host: '0.0.0.0' });
			console.log(
				`\nMOCKED_SERVERS_URL='http://localhost:${serverPort}/'`
			);
			console.log(
				`Mocked external servers listening at PORT: ${serverPort}\n`
			);
		} catch (err) {
			this.fastifyServer.log.error(err);
			process.exit(1);
		}
	}
}
