import jwt from 'jsonwebtoken';
import { ContainerInterface } from 'src/types/_containerInterface';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';


export default ({
	exceptions,
}: ContainerInterface) => (request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) => {
	const authorization = request?.headers?.authorization;

	if (!authorization)
		throw exceptions.unauthorized({
			message: 'Authorization token is required'
		});

	const token = authorization.replace('Bearer ', '');
	const decoded = jwt.decode(token);
	if (!decoded)
		throw exceptions.unauthorized({
			message: 'Authorization token is invalid'
		});

	let username = null, clientId = null;
	if (typeof (decoded) !== 'string') {
		username = decoded?.username || decoded['cognito:username'];
		clientId = decoded?.clientId || decoded?.client_id;
	}

	request.user = {
		username,
		clientId,
	};

	next();
};
