
export interface ErrorInterface {
	name?: string,
	message: string,
	code?: string | number,
	details?: unknown,
	cause?: unknown,
	stack?: string,
}
