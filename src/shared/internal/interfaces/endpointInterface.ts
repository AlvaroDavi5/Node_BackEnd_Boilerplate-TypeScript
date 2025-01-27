import { HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Multer as _Multer } from 'multer';
import { UserAuthInterface } from './userAuthInterface';
import { ErrorInterface } from './errorInterface';


export interface RequestInterface extends Request {
	id?: string,
	createdAt?: number,
	user?: UserAuthInterface,
}
export type ResponseInterface = Response
export type NextFunctionInterface = NextFunction
export type RequestFileInterface = Express.Multer.File

type errorType = Error | HttpException | ErrorInterface

export interface EndpointInterface {
	error: errorType,
	request: RequestInterface,
	response: ResponseInterface,
	next: NextFunctionInterface,
}
