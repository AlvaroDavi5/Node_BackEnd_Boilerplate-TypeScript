import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';


let toggle = 0;

export default async function defaultControllerRouter(fastify: FastifyInstance): Promise<void> {
	fastify.get('/check',
		(req: FastifyRequest, res: FastifyReply): unknown => {
			const { authorization } = req.headers;
			console.log('\n#Request Received');
			console.log('#Service: MockedService');
			console.log(`#Path: ${req.url}`);
			console.log('#Has Token: ', authorization);

			toggle++;
			if (toggle >= 3) {
				toggle = 0;
				return res.status(500).send('service unavailable');
			}

			const data = {
				url: req?.url,
				statusCode: res?.statusCode ?? 200,
				method: req?.method,
				query: req?.query,
				params: req?.params,
				body: req?.body,
			};

			return res.status(200).send(data);
		});
};
