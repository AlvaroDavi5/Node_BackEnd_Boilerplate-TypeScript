import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	listUsersService,
}: ContainerInterface) => ({
	execute: async (data: any): Promise<any> => {
		const usersList = await listUsersService.execute(data);

		return usersList;
	}
});
