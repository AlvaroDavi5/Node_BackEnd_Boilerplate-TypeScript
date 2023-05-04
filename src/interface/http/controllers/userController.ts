import { Router } from 'express';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';
import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	listUsersOperation,
	createUserOperation,
	getUserOperation,
	updateUserOperation,
	deleteUserOperation,
	jwtDecodeMiddleware,
	validatorMiddleware,
	listUsersSchema,
	createUserSchema,
	getUserSchema,
	updateUserSchema,
	deleteUserSchema,
	httpConstants,
}: ContainerInterface) => ({
	listUsers: async (req: any, response: ResponseInterface, next: NextFunctionInterface): Promise<any> => {
		try {
			const request: RequestInterface = req;
			const { query } = request;
			const result = await listUsersOperation.execute(query);

			return response
				.status(httpConstants.status.OK)
				.json(result);
		} catch (error: any) {
			next(error);
		}
	},
	createUser: async (req: any, response: ResponseInterface, next: NextFunctionInterface): Promise<any> => {
		try {
			const request: RequestInterface = req;
			const { body, user } = request;

			const result = await createUserOperation.execute(body, user);

			return response
				.status(httpConstants.status.OK)
				.json(result);
		} catch (error: any) {
			next(error);
		}
	},
	getUser: async (req: any, response: ResponseInterface, next: NextFunctionInterface): Promise<any> => {
		try {
			const request: RequestInterface = req;
			const { params: { userId }, user } = request;

			const result = await getUserOperation.execute(parseInt(userId), user);

			return response
				.status(httpConstants.status.OK)
				.json(result);
		} catch (error: any) {
			next(error);
		}
	},
	updateUser: async (req: any, response: ResponseInterface, next: NextFunctionInterface): Promise<any> => {
		try {
			const request: RequestInterface = req;
			const { params: { userId }, body, user } = request;

			const result = await updateUserOperation.execute(parseInt(userId), body, user);

			return response
				.status(httpConstants.status.OK)
				.json(result);
		} catch (error: any) {
			next(error);
		}
	},
	deleteUser: async (req: any, response: ResponseInterface, next: NextFunctionInterface): Promise<any> => {
		try {
			const request: RequestInterface = req;
			const { params: { userId }, user } = request;

			const result = await deleteUserOperation.execute(parseInt(userId), user);

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
			)
			.get(
				'/:userId',
				jwtDecodeMiddleware,
				validatorMiddleware(getUserSchema),
				this.getUser,
			)
			.put(
				'/:userId',
				jwtDecodeMiddleware,
				validatorMiddleware(updateUserSchema),
				this.updateUser,
			)
			.delete(
				'/:userId',
				jwtDecodeMiddleware,
				validatorMiddleware(deleteUserSchema),
				this.deleteUser,
			);
	},
});
