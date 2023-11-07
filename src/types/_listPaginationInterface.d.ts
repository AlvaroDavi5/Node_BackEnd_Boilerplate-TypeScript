
export interface ListQueryInterface {
	size?: number,
	page?: number,
	limit?: number,
	order?: 'ASC' | 'DESC',
	sort?: 'createdAt' | 'updatedAt' | 'deletedAt',
	selectSoftDeleted?: boolean,
	searchTerm?: string,
	[key: string]: any,
}

export interface PaginationInterface<T> {
	content: T[],
	pageNumber: number,
	pageSize: number,
	totalPages: number,
	totalItems: number,
}