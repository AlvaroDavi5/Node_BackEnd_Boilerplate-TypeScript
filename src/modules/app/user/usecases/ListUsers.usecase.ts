import { Injectable } from '@nestjs/common';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import UserService from '@app/user/services/User.service';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';


@Injectable()
export default class ListUsersUseCase {
	constructor(
		private readonly userService: UserService,
	) { }

	public async execute(query: ListQueryInterface): Promise<UserListEntity> {
		const usersList = await this.userService.list(query);
		return usersList;
	}
}
