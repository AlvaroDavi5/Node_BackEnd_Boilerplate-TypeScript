import { Not, IsNull, Equal, Like, In, And, FindManyOptions, FindOptionsWhere, FindOptionsOrder, FindOptionsSelect } from 'typeorm';
import UsersModel from '@core/infra/database/models/Users.model';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { UserInterface } from '@domain/entities/User.entity';
import { BuildParamsInterface, PaginationOptionsInterface } from '@core/infra/database/repositories/AbstractRepository.repository';


interface UserSelectRestrictInterface {
	withoutPassword: boolean,
	withoutSensitiveData: boolean,
}

export type UserBuildParamsInterface = BuildParamsInterface<UserInterface> & UserSelectRestrictInterface;

const buildSelectParams = ({
	withoutPassword,
	withoutSensitiveData,
}: UserSelectRestrictInterface): FindOptionsSelect<UsersModel> => {
	const selectSensitiveData = withoutSensitiveData === false;
	const selectPassword = withoutPassword === false;

	const select: FindOptionsSelect<UsersModel> = {
		id: true, fullName: true,
		email: true, password: selectPassword,
		phone: selectSensitiveData, fu: true,
		docType: true, document: selectSensitiveData,
		createdAt: true, updatedAt: true,
		deletedAt: true, deletedBy: true,
	};

	return select;
};

const buildWhereParams = ({
	id,
	searchTerm,
	fullName, email,
	phone, fu,
	docType, document,
	preference,
	selectSoftDeleted,
}: UserBuildParamsInterface): FindOptionsWhere<UsersModel>[] => {
	const where: FindOptionsWhere<UsersModel>[] = [];
	const partialWhere: FindOptionsWhere<UsersModel> = {};

	if (selectSoftDeleted === true) {
		// ? AND operator
		partialWhere.deletedAt = Not(IsNull());
		partialWhere.deletedBy = Not(IsNull());
	}

	if (id) {
		partialWhere.id = id;
		where.push(partialWhere);
		return where;
	}

	if (email) partialWhere.email = email;
	if (document) partialWhere.document = document;
	if (docType) partialWhere.docType = docType;
	if (fu) partialWhere.fu = fu;
	if (phone) partialWhere.phone = phone;
	if (fullName) partialWhere.fullName = fullName;

	if (searchTerm) {
		partialWhere.fullName = Like(`%${searchTerm}%`);
	}

	if (preference?.defaultTheme) {
		partialWhere.preference = {
			defaultTheme: And(In(Object.values(ThemesEnum)), Equal(preference.defaultTheme)),
		};
	}

	where.push(partialWhere);
	return where;
};

const buildPaginationParams = ({
	limit, page,
	order, sortBy,
}: UserBuildParamsInterface): PaginationOptionsInterface<UsersModel> => {
	const paginationParams: PaginationOptionsInterface<UsersModel> = {};

	if (limit && page) {
		paginationParams.take = Number(limit) || 10; // max results
		paginationParams.skip = (Number(page) || 0) * paginationParams.take; // start from
	}

	if (sortBy || order) {
		const listOrder = order ?? 'ASC';
		const sortOrder = sortBy ?? 'createdAt';

		paginationParams.order = { [sortOrder]: listOrder };
	}

	return paginationParams;
};

export const userQueryParamsBuilder = ({

	buildParams: (data: UserBuildParamsInterface): FindManyOptions<UsersModel> => {
		const select = buildSelectParams(data);
		const where = buildWhereParams(data);
		const pagination = buildPaginationParams(data);

		return {
			select,
			where,
			...pagination,
			relations: { preference: true },
		};
	}
});
