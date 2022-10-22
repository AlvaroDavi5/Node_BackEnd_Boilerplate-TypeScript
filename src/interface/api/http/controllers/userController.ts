import { Router } from 'express';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';
import { containerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/infra/logging/logger')} ctx.logger
**/
export default ({
	createUserOperation,
	httpConstants,
	jwtDecodeMiddleware,
	validatorMiddleware,
	createUserSchema,
}: containerInterface) => ({
	createUser: async (request: RequestInterface | any, response: ResponseInterface, next: NextFunctionInterface): Promise<ResponseInterface | any> => {
		try {
			const { user, body } = request;
			const result = await createUserOperation.execute(body, user);

			return response
				.status(httpConstants.status.OK)
				.json(result);
		} catch (error: any) {
			next(error);
		}
	},

	get router() {
		return Router()
			.post(
				'/',
				jwtDecodeMiddleware,
				validatorMiddleware(createUserSchema),
				this.createUser,
			);
	},
});
