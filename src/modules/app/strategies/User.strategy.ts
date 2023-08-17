import { Injectable } from '@nestjs/common';
import UserEntity from '@modules/app/domain/entities/User.entity';
import { UserAuthInterface } from 'src/types/_userAuthInterface';


@Injectable()
export default class UserStrategy {
	public isAllowed(userData: UserEntity, userAgent: UserAuthInterface): boolean {
		if (userAgent?.username === userData.getLogin().email)
			return true;
		else
			return false;
	}
}
