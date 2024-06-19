
export interface RestClientResponseInterface<DI = unknown, EI = unknown> {
	status: number,
	error?: EI,
	data: DI,
}
