import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userPreferenceRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id, ...dataValues } = data;

		const result = await userPreferenceRepository.update(Number(id), dataValues);
		return result;
	}
});
