import { Injectable } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';
import { minutesToSeconds, secondsToMilliseconds } from '@common/utils/dates.util';


@Injectable()
export default class RequestRateLimitConstants {
	// * 3 requests per second
	public readonly short: ThrottlerOptions = {
		name: 'short',
		limit: 3,
		ttl: secondsToMilliseconds(1),
		blockDuration: secondsToMilliseconds(minutesToSeconds(5)),
	};

	// * 20 requests every 10 seconds
	public readonly medium: ThrottlerOptions = {
		name: 'medium',
		limit: 20,
		ttl: secondsToMilliseconds(10),
		blockDuration: secondsToMilliseconds(minutesToSeconds(10)),
	};

	// * 100 requests per minute
	public readonly long: ThrottlerOptions = {
		name: 'long',
		limit: 100,
		ttl: secondsToMilliseconds(60),
		blockDuration: secondsToMilliseconds(minutesToSeconds(30)),
	};
}
