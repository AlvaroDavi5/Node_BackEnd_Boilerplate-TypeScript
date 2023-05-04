import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id } = data;

		const result = await userRepository.getById(Number(id));
		return result;
	}
});
