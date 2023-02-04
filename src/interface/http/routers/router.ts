import express from 'express';
import compression from 'compression';
import handler from 'express-async-handler';
import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
**/
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
			.status(200)
			.json({
				url: request?.url,
				statusCode: request?.statusCode || 200,
				method: request?.method,
				query: request?.query,
				params: request?.params,
				body: request?.body,
			});
	});

	// application routes
	apiRouter.use('/docs', ctx.swaggerMiddleware);
	apiRouter.use('/users', handler(ctx.userController.router));

	// default response
	defaultRouter.use('/api', apiRouter);
	defaultRouter.use('/*', (request, response, next) => next(
		ctx.exceptions.notFound('Not Found')
	));
	defaultRouter.use(ctx.httpErrorMiddleware);

	return defaultRouter;
};
