import { AnySchema } from 'joi';
import { ContainerInterface } from 'src/container';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';


const wrapperError = (error: any) => {
	return error?.map(({ message, path }: any) => ({
		message,
		path: path.join('.'),
	}));
};

const validate = (req: RequestInterface, schema: AnySchema) =>
	schema.validate(req, {
		abortEarly: false,
		stripUnknown: true,
		allowUnknown: true,
	});

const filterReceivedRequest = (req: RequestInterface, value: any) => {
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

export default ({
	logger,
}: ContainerInterface) => (schema: AnySchema) => {
	return (request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface): any => {
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
