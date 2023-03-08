import { Router } from 'express';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';
import { ContainerInterface } from 'src/container';


export default ({
	listUsersOperation,
	createUserOperation,
	jwtDecodeMiddleware,
	validatorMiddleware,
	listUsersSchema,
	createUserSchema,
	httpConstants,
}: ContainerInterface) => ({
	listUsers: async (request: RequestInterface | any, response: ResponseInterface, next: NextFunctionInterface): Promise<ResponseInterface | any> => {
		try {
			const { query } = request;
			const result = await listUsersOperation.execute(query);

			return response
				.status(httpConstants.status.OK)
				.json(result);
		} catch (error: any) {
			next(error);
		}
	},
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
			.get(
				'/',
				validatorMiddleware(listUsersSchema),
				this.listUsers,
			)
			.post(
				'/',
				jwtDecodeMiddleware,
				validatorMiddleware(createUserSchema),
				this.createUser,
			);
	},
});
