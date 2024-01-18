import { Router } from 'express';


let toggle = 0;

export default {
	healthcheck: async (req: any, res: any) => {
		const { authorization } = req.headers;
		console.log('\n#Request Received');
		console.log('#Service: MockedService');
		console.log(`#Path: ${req.path}`);
		console.log('#Has Token: ', !!authorization);

		toggle++;
		if (toggle >= 3) {
			toggle = 0;
			return res.status(500).send('service unavailable');
		}

		const data = {
			url: req?.url,
			statusCode: req?.statusCode ?? 200,
			method: req?.method,
			query: req?.query,
			params: req?.params,
			body: req?.body,
		};

		return res.status(200).send(data);
	},

	router() {
		const router = Router();

		router.get('/check', this.healthcheck);

		return router;
	},
};
