import { Not, IsNull, Equal, Like, In, And, FindManyOptions, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import UsersModel from '@core/infra/database/models/Users.model';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { UserInterface } from '@domain/entities/User.entity';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';


interface PaginationOptionsInterface<M = any> {
	take?: number, // limit
	skip?: number, // offset
	order?: FindOptionsOrder<M>,
}

const buildPaginationParams = ({ limit, page, order, sortBy }: ListQueryInterface): PaginationOptionsInterface => {
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

const buildWhereParams = ({
	searchTerm,
	selectSoftDeleted,
	id,
	fullName,
	email,
	phone,
	docType,
	document,
	fu,
	preference,
}: ListQueryInterface & UserInterface): FindOptionsWhere<UsersModel>[] => {
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

export const userQueryParamsBuilder = ({

	buildParams: (data: any): FindManyOptions<UsersModel> => {
		const where = buildWhereParams(data);
		const pagination = buildPaginationParams(data);

		return {
			...pagination,
			where,
		};
	}
});
