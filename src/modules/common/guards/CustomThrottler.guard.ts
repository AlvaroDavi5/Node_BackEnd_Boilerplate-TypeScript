import { Reflector } from '@nestjs/core';
import { Injectable, Scope, ExecutionContext, CanActivate } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage, InjectThrottlerOptions, ThrottlerModuleOptions, ThrottlerOptions, Resolvable } from '@nestjs/throttler';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { Socket } from 'socket.io-client';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import { CUSTOM_THROTTLER_DECORATOR } from '@api/decorators/customThrottler.decorator';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';

@Injectable({ scope: Scope.DEFAULT })
export default class CustomThrottlerGuard implements CanActivate {
	private readonly globalThrottlers: ThrottlerOptions[];
	private readonly headerPrefix: string;

	constructor(
		private readonly reflector: Reflector,
		@InjectThrottlerOptions() private readonly throttlerModuleOptions: ThrottlerModuleOptions,
		@InjectThrottlerStorage() private readonly throttlerStorage: ThrottlerStorage,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		this.globalThrottlers = Array.isArray(this.throttlerModuleOptions)
			? this.throttlerModuleOptions
			: this.throttlerModuleOptions.throttlers;
		this.headerPrefix = 'X-RateLimit';
	}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const contextType = context.getType();

		const continues: boolean[] = [];
		for (const throttler of [...this.globalThrottlers, ...this.getCustomThrottlers(context)]) {
			const { name: throttlerName, limit, ttl, blockDuration } = await this.getThrottlerData(context, throttler);
			const { skipIf } = throttler;

			this.logger.verbose(`Running guard with '${throttlerName}' throttler in ${contextType} for ${limit} requests in ${ttl} ms`);

			if (skipIf && skipIf(context) === true) {
				continues.push(true);
				continue;
			}

			switch (contextType) {
				case 'http':
					continues.push(await this.handleHttpRequest(context.switchToHttp(), throttlerName, ttl, limit, blockDuration));
					break;
				case 'ws':
					continues.push(await this.handleWsEvent(context.switchToWs(), throttlerName, ttl, limit, blockDuration));
					break;
				default:
					continues.push(false);
					break;
			}
		}

		return continues.every((cont) => cont);
	}

	private async handleHttpRequest(
		httpContext: HttpArgumentsHost,
		throttlerName: string,
		ttl: number,
		limit: number,
		blockDuration: number
	): Promise<boolean> {
		const { req, res } = this.getRequestResponse(httpContext);

		const ip = req?.ip ?? req?.socket?.remoteAddress ?? '_';
		const route = this.getRoute(req);
		const key = this.generateKey(throttlerName, 'http', ip, route);
		const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } = await this.throttlerStorage.increment(key, ttl, limit, blockDuration, throttlerName);

		res.header(`${this.headerPrefix}-Limit-${throttlerName}`, `${limit}`);
		res.header(`${this.headerPrefix}-Remaining-${throttlerName}`, `${Math.max(0, limit - totalHits)}`);
		res.header(`${this.headerPrefix}-Reset-${throttlerName}`, `${timeToExpire}`);

		if (isBlocked) {
			res.header('Retry-After', `${timeToBlockExpire}`);
			this.throwException(key, ip, ttl, limit, totalHits, timeToExpire, timeToBlockExpire);
		}

		return true;
	}

	private async handleWsEvent(wsContext: WsArgumentsHost, throttlerName: string, ttl: number, limit: number, blockDuration: number): Promise<boolean> {
		const socket = wsContext.getClient<Socket>();
		const event = wsContext.getPattern();

		const socketId = socket.id ?? '_';
		const key = this.generateKey(throttlerName, 'ws', socketId, event);
		const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } = await this.throttlerStorage.increment(key, ttl, limit, blockDuration, throttlerName);

		if (isBlocked) {
			this.throwException(key, socketId, ttl, limit, totalHits, timeToExpire, timeToBlockExpire);
		}

		return true;
	}

	private getRoute(req: RequestInterface): string {
		return `[${req.method.toUpperCase()}]${req.path}`;
	}

	private generateKey(throttlerName: string, clientContext: string, clientId: string, callCode: string): string {
		return `${CustomThrottlerGuard.name}:${throttlerName}:${clientContext}:${clientId}:${callCode}`;
	}

	private getCustomThrottlers(context: ExecutionContext): ThrottlerOptions[] {
		const throttlers: ThrottlerOptions[] = [];

		const methodCustomThrottler = this.reflector.get<ThrottlerOptions, string>(CUSTOM_THROTTLER_DECORATOR, context.getHandler());
		const classCustomThrottler = this.reflector.get<ThrottlerOptions, string>(CUSTOM_THROTTLER_DECORATOR, context.getClass());

		if (methodCustomThrottler) throttlers.push(methodCustomThrottler);
		if (classCustomThrottler) throttlers.push(classCustomThrottler);

		return throttlers;
	}

	private async getThrottlerData(context: ExecutionContext, throttler: ThrottlerOptions): Promise<{
		name: string,
		ttl: number,
		limit: number,
		blockDuration: number,
	}> {
		const name = throttler.name ?? 'default';
		const limit = await this.resolveValue<number>(context, throttler.limit);
		const ttl = await this.resolveValue<number>(context, throttler.ttl);
		const blockDuration = await this.resolveValue<number>(context, throttler.blockDuration as number);

		return { name, ttl, limit, blockDuration };
	}

	private async resolveValue<T extends number | string | boolean>(context: ExecutionContext, resolvableValue: Resolvable<T>): Promise<T> {
		return typeof resolvableValue === 'function' ? resolvableValue(context) : resolvableValue;
	}

	private getRequestResponse(httpContext: HttpArgumentsHost): { req: RequestInterface, res: ResponseInterface } {
		return {
			req: httpContext.getRequest<RequestInterface>(),
			res: httpContext.getResponse<ResponseInterface>(),
		};
	}

	private throwException(key: string, tracker: string, ttl: number, limit: number, totalHits: number, timeToExpire: number, timeToBlockExpire: number): void {
		throw this.exceptions.manyRequests({
			message: 'Too Many Requests/Events/Retries',
			details: { key, tracker, ttl, limit, totalHits, timeToExpire, timeToBlockExpire },
		});
	}
}
