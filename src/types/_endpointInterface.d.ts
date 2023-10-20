import { Request, Response, NextFunction } from 'express';
import { UserAuthInterface } from './_userAuthInterface';


export interface RequestInterface extends Request {
	user?: UserAuthInterface,
}
export type ResponseInterface = Response
export type NextFunctionInterface = NextFunction

export interface EndpointInterface {
	error: Error | any,
	request: RequestInterface,
	response: ResponseInterface,
	next: NextFunctionInterface,
}
