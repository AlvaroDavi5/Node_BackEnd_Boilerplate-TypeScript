import { ContainerInterface } from 'src/container';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id } = data;

		const result = await userRepository.getById(Number(id));
		return result;
	}
});
