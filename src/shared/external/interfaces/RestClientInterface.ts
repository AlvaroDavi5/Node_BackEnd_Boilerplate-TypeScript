
export interface RestClientResponseInterface<DI = unknown> {
	data: DI,
	status: number,
	headers: Record<string, unknown>,
}
