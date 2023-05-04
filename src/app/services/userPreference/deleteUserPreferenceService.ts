import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	userPreferenceRepository,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const { id, softDelete } = data;

		const result = await userPreferenceRepository.deleteOne(Number(id), Boolean(softDelete));
		return result;
	}
});
