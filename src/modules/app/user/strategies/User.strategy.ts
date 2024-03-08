import { Injectable } from '@nestjs/common';
import UserEntity from '@domain/entities/User.entity';
import { UserAuthInterface } from '@shared/interfaces/userAuthInterface';


@Injectable()
export default class UserStrategy {
	public isAllowedToManageUser(userAgent: UserAuthInterface, userData: UserEntity): boolean {
		if (userAgent?.username === userData.getLogin().email)
			return true;
		else
			return false;
	}
}
