import { AnySchema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ContainerInterface } from 'src/container';


const wrapperError = (error: any) => {
	return error.map(({ message, path }: any) => ({
		message,
		path: path.join('.'),
	}));
};

const validate = (req: Request, schema: AnySchema) =>
	schema.validate(req, {
		abortEarly: false,
		stripUnknown: true,
		allowUnknown: true,
	});

const filterReceivedRequest = (req: Request, value: any) => {
	const request: any = {};

	if (value.body) {
		req.body = value.body;
		request.body = value.body;
	}

	if (value.query) {
		req.query = value.query;
		request.query = value.query;
	}

	return request;
};

/**
@param {Object} container - Dependency Injection.
@param {import('src/infra/logging/logger')} container.logger
*/
export default ({
	logger,
}: ContainerInterface) => (schema: AnySchema) => {
	return (request: Request, response: Response, next: NextFunction): any => {
		try {
			const { error, value } = validate(request, schema);
			if (error) {
				const err = new Error();
				err.name = 'Validation';

				const message = {
					title: err.name,
					message: wrapperError(error.details),
					received: request.body,
				};

				logger.error({ message });

				delete message.received;

				return response.status(400).json(message);
			}
			filterReceivedRequest(request, value);

			logger.info({
				received_request: request.body,
			});
			next();
		} catch (err) {
			next(err);
		}
	};
};
