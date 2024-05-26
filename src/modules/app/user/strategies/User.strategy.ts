import { Injectable } from '@nestjs/common';
import UserEntity from '@domain/entities/User.entity';
import { UserAuthInterface } from '@shared/interfaces/userAuthInterface';


@Injectable()
export default class UserStrategy {
	public isAllowedToManageUser(userAgent: UserAuthInterface, userData: UserEntity): boolean {
		const isTheSameUsername = userAgent?.username === userData.getLogin().email;
		const isTheSameId = userAgent?.clientId === userData.getId();

		if (isTheSameUsername && isTheSameId)
			return true;

		return false;
	}
}
