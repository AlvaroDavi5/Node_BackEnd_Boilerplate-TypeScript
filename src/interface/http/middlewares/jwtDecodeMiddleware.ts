import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ContainerInterface } from 'src/container';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/infra/errors/exceptions')} ctx.exceptions
**/
export default ({
	exceptions,
}: ContainerInterface) => (request: Request | any, response: Response, next: NextFunction) => {
	const authorization = request?.headers?.authorization;

	if (!authorization)
		throw exceptions.unauthorized('Authorization token is required');

	const token = authorization.replace('Bearer ', '');
	const decoded = jwt.decode(token);
	if (!decoded)
		throw exceptions.unauthorized('Authorization token is invalid');

	let cognitoUserName = '', cognitoClientId = '';
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
