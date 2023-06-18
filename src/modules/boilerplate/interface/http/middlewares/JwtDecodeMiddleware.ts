import { Injectable, NestMiddleware } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import Exceptions from 'src/infra/errors/exceptions';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';


@Injectable()
export default class JwtDecodeMiddleware implements NestMiddleware {
	constructor(
		private readonly exceptions: Exceptions,
	) { }

	public use(request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) {
		const authorization = request?.headers?.authorization;

		if (!authorization)
			throw this.exceptions.unauthorized({
				message: 'Authorization token is required'
			});

		const token = authorization.replace('Bearer ', '');
		const decoded = jwt.decode(token);
		if (!decoded)
			throw this.exceptions.unauthorized({
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
	}
}
