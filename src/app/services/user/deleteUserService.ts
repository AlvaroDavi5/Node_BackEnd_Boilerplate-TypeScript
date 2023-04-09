import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id, softDelete, userAgentId } = data;

		const result = await userRepository.deleteOne(Number(id), Boolean(softDelete), String(userAgentId));
		return result;
	}
});
