import { LogLevelEnum } from '@core/logging/logger';
import { captureException, captureMessage, captureLog } from '@common/utils/sentryCalls.util';
import { mockObservable } from 'tests/unit/support/mocks/mockObservable';


jest.mock('@sentry/nestjs', () => ({
	captureException: (...args: unknown[]) => { mockObservable.call(...args); },
	captureMessage: (...args: unknown[]) => { mockObservable.call(...args); },
	logger: {
		debug: (...args: unknown[]) => mockObservable.call(...args),
		info: (...args: unknown[]) => mockObservable.call(...args),
		warn: (...args: unknown[]) => mockObservable.call(...args),
		error: (...args: unknown[]) => mockObservable.call(...args),
		fatal: (...args: unknown[]) => mockObservable.call(...args),
		trace: (...args: unknown[]) => mockObservable.call(...args),
	},
}));

describe('Modules :: Common :: Utils :: SentryCalls', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('# Capture Exceptions', () => {
		test('Should send exception to Sentry', () => {
			captureException(new Error('Test Error'), {
				data: { key: 'value' },
				user: { id: 'user_id', email: 'test.user@nomail.com' },
			});
			expect(mockObservable.call).toHaveBeenCalledWith(
				new Error('Test Error'),
				{
					level: 'error',
					data: { key: 'value' },
					user: { id: 'user_id', email: 'test.user@nomail.com' },
				}
			);
		});
	});

	describe('# Capture Messages and Logs', () => {
		test('Should send messages to Sentry', () => {
			captureMessage('Test Message', LogLevelEnum.HTTP);
			expect(mockObservable.call).toHaveBeenCalledWith('Test Message', { level: 'info' });
		});

		test('Should send logs to Sentry', () => {
			captureLog('Test Message', LogLevelEnum.WARN);
			expect(mockObservable.call).toHaveBeenCalledWith('Test Message');
		});
	});
});
