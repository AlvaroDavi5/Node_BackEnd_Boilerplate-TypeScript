import { Injectable } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';


@Injectable()
export default class RequestRateConstants {
	// * 3 calls per second
	public readonly short: ThrottlerOptions = {
		name: 'short',
		limit: 3,
		ttl: (1 * 1000),
	};

	// * 20 calls every 10 seconds
	public readonly medium: ThrottlerOptions = {
		name: 'medium',
		limit: 20,
		ttl: (10 * 1000),
	};

	// * 100 calls per minute
	public readonly long: ThrottlerOptions = {
		name: 'long',
		limit: 100,
		ttl: (60 * 1000),
	};
}
