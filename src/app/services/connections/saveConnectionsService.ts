import { ContainerInterface } from 'src/container';


export default ({
	redisClient,
	cacheAccessHelper,
}: ContainerInterface) => ({
	execute: async (id: string, data: any) => {
		const time = 60 * 60 * 24; // 1 day
		const key: string = cacheAccessHelper.generateKey(id, 'connections');

		const savedConnection = await redisClient.set(
			key,
			data,
			time,
		);

		return savedConnection;
	},
});
