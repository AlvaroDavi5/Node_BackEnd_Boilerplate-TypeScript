import { Request, Response, NextFunction } from 'express';
import { UserAuthInterface } from './_userAuthInterface';


export interface RequestInterface extends Request {
	user?: UserAuthInterface,
}
export interface ResponseInterface extends Response { }
export interface NextFunctionInterface extends NextFunction { }

export interface EndpointInterface {
	error: Error | any,
	request: RequestInterface,
	response: ResponseInterface,
	next: NextFunctionInterface,
}
