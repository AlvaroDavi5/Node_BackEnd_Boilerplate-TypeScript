import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { captureException, captureMessage, captureLog } from '@common/utils/sentryCalls.util';
import { LogLevelEnum } from '@common/enums/logLevel.enum';
import { mockObservable } from 'tests/unit/support/mocks/mockObservable';


jest.mock('@sentry/nestjs', () => ({
	captureException: (...args: unknown[]) => { mockObservable.call(...args); },
	captureMessage: (...args: unknown[]) => { mockObservable.call(...args); },
	logger: {
		debug: (...args: unknown[]) => mockObservable.call('debug', ...args),
		info: (...args: unknown[]) => mockObservable.call('info', ...args),
		warn: (...args: unknown[]) => mockObservable.call('warn', ...args),
		error: (...args: unknown[]) => mockObservable.call('error', ...args),
		fatal: (...args: unknown[]) => mockObservable.call('fatal', ...args),
		trace: (...args: unknown[]) => mockObservable.call('trace', ...args),
	},
}));

describe('Modules :: Common :: Utils :: SentryCalls', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('# Capture Exceptions', () => {
		test('Should send bad request exception to Sentry', () => {
			captureException(new BadRequestException('Test Error'), {
				data: { key: 'value' },
				user: { id: 'user_id', email: 'test.user@nomail.com' },
			});
			expect(mockObservable.call).toHaveBeenCalledWith(
				new BadRequestException('Test Error'),
				{
					level: 'warning',
					data: { key: 'value' },
					user: { id: 'user_id', email: 'test.user@nomail.com' },
				}
			);
		});

		test('Should send service unavailable exception to Sentry', () => {
			captureException(new ServiceUnavailableException('Test Error'), {
				data: { key: 'value' },
				user: { id: 'user_id', email: 'test.user@nomail.com' },
			});
			expect(mockObservable.call).toHaveBeenCalledWith(
				new ServiceUnavailableException('Test Error'),
				{
					level: 'fatal',
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
			captureLog('Log', LogLevelEnum.WARN);
			expect(mockObservable.call).toHaveBeenCalledWith('warn', 'Log');
			captureLog('Log', LogLevelEnum.INFO);
			expect(mockObservable.call).toHaveBeenCalledWith('info', 'Log');
			captureLog('Log', LogLevelEnum.VERBOSE);
			expect(mockObservable.call).toHaveBeenCalledWith('trace', 'Log');
			captureLog('Log', LogLevelEnum.HTTP);
			expect(mockObservable.call).toHaveBeenCalledWith('warn', 'Log');
		});
	});
});
