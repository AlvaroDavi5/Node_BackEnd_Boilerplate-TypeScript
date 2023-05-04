import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userPreferenceRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const result = await userPreferenceRepository.create(data);
		return result;
	}
});
