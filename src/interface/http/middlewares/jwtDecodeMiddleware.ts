import jwt from 'jsonwebtoken';
import { ContainerInterface } from 'src/container';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';


export default ({
	exceptions,
}: ContainerInterface) => (request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) => {
	const authorization = request?.headers?.authorization;

	if (!authorization)
		throw exceptions.unauthorized('Authorization token is required');

	const token = authorization.replace('Bearer ', '');
	const decoded = jwt.decode(token);
	if (!decoded)
		throw exceptions.unauthorized('Authorization token is invalid');

	let cognitoUserName = null, cognitoClientId = null;
	if (typeof (decoded) !== 'string') {
		cognitoUserName = decoded?.username || decoded['cognito:username'];
		cognitoClientId = decoded?.client_id;
	}

	request.user = {
		cognitoUserName: cognitoUserName,
		cognitoClientId: cognitoClientId,
	};

	next();
};
