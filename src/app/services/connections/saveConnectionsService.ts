import cacheEnum from 'src/domain/enums/cacheEnum';
import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	redisClient,
	configs,
	cacheAccessHelper,
}: ContainerInterface) => ({
	execute: async (id: string, data: any) => {
		const time = configs.cache.expirationTime.connections;
		const key: string = cacheAccessHelper.generateKey(id, cacheEnum.CONNECTIONS);

		const savedConnection = await redisClient.set(
			key,
			data,
			time,
		);

		return savedConnection;
	},
});
