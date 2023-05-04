import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id, ...dataValues } = data;

		const result = await userRepository.update(Number(id), dataValues);
		return result;
	}
});
