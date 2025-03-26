import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';


export const CUSTOM_THROTTLER_DECORATOR = 'CUSTOM_THROTTLER_DECORATOR';

export function customThrottlerDecorator(options: ThrottlerOptions): CustomDecorator {
	return SetMetadata<string, ThrottlerOptions>(CUSTOM_THROTTLER_DECORATOR, {
		...options,
		name: options.name ?? 'custom',
	});
}
