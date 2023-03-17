import { ContainerInterface } from 'src/container';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const result = await userRepository.create(data);
		return result;
	}
});
