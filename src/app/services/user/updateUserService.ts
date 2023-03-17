import { ContainerInterface } from 'src/container';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id, ...dataValues } = data;

		const result = await userRepository.update(Number(id), dataValues);
		return result;
	}
});
