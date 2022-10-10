import { Request, Response, NextFunction } from 'express';


interface RequestInterface extends Request {
	user: object | any,
}
type ResponseInterface = Response;
type NextFunctionInterface = NextFunction;

export interface EndpointInterface {
	error: Error | any,
	request: RequestInterface | any,
	response: ResponseInterface | any,
	next: NextFunctionInterface | any,
}
