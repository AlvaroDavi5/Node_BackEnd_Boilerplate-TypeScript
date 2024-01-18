import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import Exceptions from '@core/infra/errors/Exceptions';


@Injectable()
export default class CustomThrottlerGuard extends ThrottlerGuard {
	private readonly exceptions: Exceptions = new Exceptions();

	public async handleRequest(
		context: ExecutionContext,
		limit: number,
		ttl: number,
		throttler: ThrottlerOptions,
	): Promise<boolean> {
		const throttlerName = throttler.name ?? 'defaultThrottler';
		console.log(`Running guard '${CustomThrottlerGuard.name}' with '${throttlerName}' throttler`);

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
