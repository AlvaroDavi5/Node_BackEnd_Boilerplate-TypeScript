import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userPreferenceRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { userId } = data;

		const result = await userPreferenceRepository.findOne({ userId: Number(userId) });
		return result;
	}
});
