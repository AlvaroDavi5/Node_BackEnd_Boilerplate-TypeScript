
export interface RestClientResponseInterface<DI = unknown, EI = unknown> {
	status: number,
	headers: { [key: string]: unknown },
	data: DI,
	error?: EI,
}
