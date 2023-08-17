import { Request, Response, NextFunction } from 'express';
import { UserAuthInterface } from './_userAuthInterface';


interface RequestInterface extends Request {
	user?: UserAuthInterface,
}
type ResponseInterface = Response;
type NextFunctionInterface = NextFunction;

export interface EndpointInterface {
	error: Error | any,
	request: RequestInterface,
	response: ResponseInterface,
	next: NextFunctionInterface,
}
