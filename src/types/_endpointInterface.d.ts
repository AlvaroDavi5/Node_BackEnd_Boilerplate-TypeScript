import { Request, Response, NextFunction } from 'express';


interface RequestInterface extends Request {
	user: {
		cognitoUserName: string | null | undefined,
		cognitoClientId: string | null | undefined,
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
