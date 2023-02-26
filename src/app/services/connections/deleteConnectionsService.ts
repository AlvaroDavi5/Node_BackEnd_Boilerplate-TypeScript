import { ContainerInterface } from 'src/container';


export default ({
	redisClient,
	cacheAccessHelper,
}: ContainerInterface) => ({
	execute: async (id: string) => {
		const key: string = cacheAccessHelper.generateKey(id, 'connections');

		const deletedConnection = await redisClient.delete(
			key,
		);

		return deletedConnection;
	},
});
