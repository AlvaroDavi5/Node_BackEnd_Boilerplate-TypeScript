import { Injectable } from '@nestjs/common';
import UserEntity from '@modules/app/domain/entities/User';
import { userAuthType } from 'src/types/_userAuthInterface';


@Injectable()
export default class UserStrategy {
	public manageAuth(userData: UserEntity, userAgent: userAuthType): boolean {
		if (userAgent?.username === userData.getLogin().email)
			return true;
		else
			return false;
	}
}
