import { HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserAuthInterface } from './userAuthInterface';
import { ErrorInterface } from './errorInterface';


export interface RequestInterface extends Request {
	user?: UserAuthInterface,
}
export type ResponseInterface = Response
export type NextFunctionInterface = NextFunction

type errorType = Error | HttpException | ErrorInterface

export interface EndpointInterface {
	error: errorType,
	request: RequestInterface,
	response: ResponseInterface,
	next: NextFunctionInterface,
}
