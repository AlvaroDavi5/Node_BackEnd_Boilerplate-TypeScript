
export interface ListQueryInterface {
	limit?: number, // results amount by page
	page?: number, // page index
	order?: 'ASC' | 'DESC', // list order
	sortBy?: 'createdAt' | 'updatedAt' | 'deletedAt', // sort by attribute
	searchTerm?: string, // term for search
	selectSoftDeleted?: boolean, // filter just soft-deleted registers
}

export interface PaginationInterface<T> {
	content: T[], // results list
	pageNumber: number, // page index
	pageSize: number, // amount of items by page
	totalPages: number, // pages amount
	totalItems: number, // all results amount
}
