import express from 'express';
import compression from 'compression';
import handler from 'express-async-handler';
import { containerInterface } from 'src/types/_containerInterface';


export default (container: containerInterface) => {
	const defaultRouter = express.Router();
	const apiRouter = express.Router();

	defaultRouter
		.use(express.json())
		.use(express.urlencoded({ extended: true }))
		.use(compression());

	// default response
	defaultRouter.use('/*', (request, response, next) => next(container.exception.notFound()));
	defaultRouter.use(container.httpErrorMiddleware);

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
	apiRouter.use('/docs', container.swaggerMiddleware);

	// application routes
	apiRouter.use('/users', handler(container.userController.router));
	apiRouter.use('/user-preferences', handler(container.userPreferenceController.router));

	defaultRouter.use('/api', apiRouter);

	return defaultRouter;
};
