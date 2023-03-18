
export interface ErrorInterface {
	name?: string,
	message: string,
	stack?: string | undefined,
	details?: any;
	statusCode?: number | undefined;
	errorType?: string | undefined;
}
