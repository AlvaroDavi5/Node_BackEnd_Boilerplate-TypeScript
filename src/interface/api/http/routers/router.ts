/**
 @param {Object} ctx - Dependency Injection (container)
**/
import express from 'express';
import compression from 'compression';
import handler from 'express-async-handler';
import { containerInterface } from 'src/types/_containerInterface';


export default (ctx: containerInterface) => {
	const defaultRouter = express.Router();
	const apiRouter = express.Router();

	defaultRouter
		.use(express.json())
		.use(express.urlencoded({ extended: true }))
		.use(compression());

	// default response
	defaultRouter.use('/*', (request, response, next) => next(ctx.exception.notFound()));
	defaultRouter.use(ctx.httpErrorMiddleware);

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
	apiRouter.use('/docs', ctx.swaggerMiddleware);

	// application routes
	apiRouter.use('/users', handler(ctx.userController.router));
	apiRouter.use('/user-preferences', handler(ctx.userPreferenceController.router));

	defaultRouter.use('/api', apiRouter);

	return defaultRouter;
};
