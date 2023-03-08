import { Request, Response, NextFunction } from 'express';


interface RequestInterface extends Request {
	user: {
		username: string | null | undefined,
		clientId: string | null | undefined,
	} | null | undefined,
}
type ResponseInterface = Response;
type NextFunctionInterface = NextFunction;

export interface EndpointInterface {
	error: Error | any,
	request: RequestInterface,
	response: ResponseInterface,
	next: NextFunctionInterface,
}
