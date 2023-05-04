import express from 'express';
import compression from 'compression';
import handler from 'express-async-handler';
import { ContainerInterface } from 'src/types/_containerInterface';


export default (ctx: ContainerInterface) => {
	const defaultRouter = express.Router();
	const apiRouter = express.Router();

	defaultRouter
		.use(express.json())
		.use(express.urlencoded({ extended: true }))
		.use(compression());

	// internal routes
	apiRouter.get('/check', (request, response) => {
		return response
			.status(ctx.httpConstants.status.OK)
			.json({
				url: request?.url,
				statusCode: request?.statusCode || 200,
				method: request?.method,
				query: request?.query,
				params: request?.params,
				body: request?.body,
			}); // [METHOD]:CODE http://url/:param1/:param2?query1=X&query2=Y { "body": {} }
	});

	// application routes
	apiRouter.use('/docs', ctx.swaggerMiddleware);
	apiRouter.use('/users', handler(ctx.userController.router));

	// default response
	defaultRouter.use('/api', apiRouter);
	defaultRouter.use('/*', (request, response, next) => next(
		ctx.exceptions.notFound({
			message: 'Endpoint Not Found',
			details: { baseUrl: request.baseUrl },
		})
	));
	defaultRouter.use(ctx.httpErrorMiddleware);

	return defaultRouter;
};
