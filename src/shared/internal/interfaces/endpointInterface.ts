import type { HttpException } from '@nestjs/common';
import type { UserAuthInterface } from './userAuthInterface';
import type { ErrorInterface } from './errorInterface';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';

export interface RequestInterface extends FastifyRequest {
	user?: UserAuthInterface,
}
export type ResponseInterface = FastifyReply
export type RequestFileInterface = MultipartFile

type PartialMessageEventType<T> = Partial<MessageEvent<T>>
type SseInterface<TD = unknown> =
	| { attempt: number, data: TD, text?: never, error?: never }
	| { attempt: number, text: string, data?: never, error?: never }
	| { attempt: number, error: errorType, data?: never, text?: never };
export type ResponseSseInterface<TD> = PartialMessageEventType<SseInterface<TD>>

type errorType = Error | HttpException | ErrorInterface

export interface EndpointInterface {
	error: errorType,
	request: RequestInterface,
	response: ResponseInterface,
}
