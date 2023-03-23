import cacheEnum from 'src/domain/enums/cacheEnum';
import { ContainerInterface } from 'src/container';


export default ({
	redisClient,
	cacheAccessHelper,
}: ContainerInterface) => ({
	execute: async (id: string) => {
		const key: string = cacheAccessHelper.generateKey(id, cacheEnum.CONNECTIONS);

		const deletedConnection = await redisClient.delete(
			key,
		);

		return deletedConnection;
	},
});
