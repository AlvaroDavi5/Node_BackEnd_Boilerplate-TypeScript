import { Injectable, ExecutionContext, Scope } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { Logger } from 'winston';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';


@Injectable({ scope: Scope.DEFAULT })
export default class CustomThrottlerGuard extends ThrottlerGuard {
	private readonly exceptions: Exceptions = new Exceptions();
	private readonly logger: Logger = generateLogger(CustomThrottlerGuard.name);

	public async handleRequest(
		context: ExecutionContext,
		limit: number,
		ttl: number,
		throttler: ThrottlerOptions,
	): Promise<boolean> {
		const throttlerName = throttler.name ?? 'defaultThrottler';
		this.logger.verbose(`Running guard with '${throttlerName}' throttler for ${throttler.limit} requests in ${throttler.ttl} ms`);

		const { req, res } = this.getRequestResponse(context);

		const tracker = await this.getTracker(req);
		const key = this.generateKey(context, tracker, throttlerName);
		const { totalHits, timeToExpire } = await this.storageService.increment(key, ttl);

		if (totalHits > limit) {
			res.header('Retry-After', timeToExpire);

			throw this.exceptions.manyRequests({
				message: 'Too Many Requests',
				details: {
					key,
					limit,
					ttl,
					tracker,
					timeToExpire,
					totalHits,
				},
			});
		}

		res.header(`${this.headerPrefix}-Limit-${throttlerName}`, limit);
		res.header(`${this.headerPrefix}-Remaining-${throttlerName}`, Math.max(0, limit - totalHits));
		res.header(`${this.headerPrefix}-Reset-${throttlerName}`, timeToExpire);

		return true;
	}
}
