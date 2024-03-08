import Exceptions from '../../../../../../src/modules/core/infra/errors/Exceptions';


describe('Infra :: Errors :: Exceptions', () => {
	const exceptions = new Exceptions();

	describe('# All Exceptions', () => {
		test('Should return a Contract exception', () => {
			const exception = exceptions.contract({
				message: 'New Contract Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('contract');
			expect(exception.message).toBe('New Contract Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(400);
			expect(exception.getResponse()).toMatchObject({ error: 'Bad Request', message: 'New Contract Exception', statusCode: 400, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a Business exception', () => {
			const exception = exceptions.business({
				message: 'New Business Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('business');
			expect(exception.message).toBe('New Business Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(403);
			expect(exception.getResponse()).toMatchObject({ error: 'Forbidden', message: 'New Business Exception', statusCode: 403, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a Unauthorized exception', () => {
			const exception = exceptions.unauthorized({
				message: 'New Unauthorized Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('unauthorized');
			expect(exception.message).toBe('New Unauthorized Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(401);
			expect(exception.getResponse()).toMatchObject({ error: 'Unauthorized', message: 'New Unauthorized Exception', statusCode: 401, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a TooManyRequests exception', () => {
			const exception = exceptions.manyRequests({
				message: 'New TooManyRequests Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('manyRequests');
			expect(exception.message).toBe('New TooManyRequests Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(429);
			expect(exception.getResponse()).toMatchObject({ error: 'Too Many Requests', message: 'New TooManyRequests Exception', statusCode: 429, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a Conflict exception', () => {
			const exception = exceptions.conflict({
				message: 'New Conflict Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('conflict');
			expect(exception.message).toBe('New Conflict Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(409);
			expect(exception.getResponse()).toMatchObject({ error: 'Conflict', message: 'New Conflict Exception', statusCode: 409, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a NotFound exception', () => {
			const exception = exceptions.notFound({
				message: 'New NotFound Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('notFound');
			expect(exception.message).toBe('New NotFound Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(404);
			expect(exception.getResponse()).toMatchObject({ error: 'Not Found', message: 'New NotFound Exception', statusCode: 404, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a Integration exception', () => {
			const exception = exceptions.integration({
				message: 'New Integration Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('integration');
			expect(exception.message).toBe('New Integration Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(503);
			expect(exception.getResponse()).toMatchObject({ error: 'Service Unavailable', message: 'New Integration Exception', statusCode: 503, details: JSON.stringify({ info: 'A error occurred' }) });
		});

		test('Should return a Internal exception', () => {
			const exception = exceptions.internal({
				message: 'New Internal Exception',
				stack: 'error1, error2, error3',
				details: {
					info: 'A error occurred',
				},
			});

			expect(exception.name).toBe('internal');
			expect(exception.message).toBe('New Internal Exception');
			expect(exception.stack).not.toBeNull();
			expect(exception.cause).toEqual({ info: 'A error occurred' });
			expect(exception.getStatus()).toBe(500);
			expect(exception.getResponse()).toMatchObject({ error: 'Internal Server Error', message: 'New Internal Exception', statusCode: 500, details: JSON.stringify({ info: 'A error occurred' }) });
		});
	});
});
