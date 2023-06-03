import UserEntity from 'src/domain/entities/User';
import { userAuthType } from 'src/types/_userAuthInterface';
import { ContainerInterface } from 'src/types/_containerInterface';


export default (ctx: ContainerInterface) => ({
	execute: (userData: UserEntity, userAgent: userAuthType): boolean => {
		if (userAgent?.username === userData.getLogin().email)
			return true;
		else
			return false;
	}
});
