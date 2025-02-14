import { Injectable } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';
import { secondsToMilliseconds } from '@common/utils/dates.util';


@Injectable()
export default class RequestRateLimitConstants {
	// * 3 calls per second
	public readonly short: ThrottlerOptions = {
		name: 'short',
		limit: 3,
		ttl: secondsToMilliseconds(1),
	};

	// * 20 calls every 10 seconds
	public readonly medium: ThrottlerOptions = {
		name: 'medium',
		limit: 20,
		ttl: secondsToMilliseconds(10),
	};

	// * 100 calls per minute
	public readonly long: ThrottlerOptions = {
		name: 'long',
		limit: 100,
		ttl: secondsToMilliseconds(60),
	};
}
