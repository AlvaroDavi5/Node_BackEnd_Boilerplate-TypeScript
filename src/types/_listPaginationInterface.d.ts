
export interface ListQueryInterface {
	limit?: number, // results amount by page
	page?: number, // page index
	order?: 'ASC' | 'DESC',
	sortBy?: 'createdAt' | 'updatedAt' | 'deletedAt',
	searchTerm?: string,
	selectSoftDeleted?: boolean,
}

export interface PaginationInterface<T> {
	content: T[], // results list
	pageNumber: number, // page index
	pageSize: number, // page results amount
	totalPages: number, // pages amount
	totalItems: number, // all results amount
}
