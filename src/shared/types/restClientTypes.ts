
export type requestMethodType = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RestClientResponseInterface<DI = any> {
	status: number,
	error?: any,
	data: DI,
}
