import Exceptions from '../../../../src/infra/errors/Exceptions';
import configs from '../../../../src/configs/configs.config';


describe('Infra :: Errors :: Exceptions', () => {
	// // mocks
	const configServiceMock: any = {
		get: (propertyPath?: string) => {
			if (propertyPath)
				return configs()[propertyPath];
			else
				return configs();
		},
	};

	const exceptions = new Exceptions(configServiceMock);

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
			expect(exception.getResponse()).toEqual({ error: 'Bad Request', message: 'New Contract Exception', statusCode: 400 });
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
			expect(exception.getResponse()).toEqual({ error: 'Forbidden', message: 'New Business Exception', statusCode: 403 });
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
			expect(exception.getResponse()).toEqual({ error: 'Unauthorized', message: 'New Unauthorized Exception', statusCode: 401 });
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
			expect(exception.getResponse()).toEqual({ error: 'Conflict', message: 'New Conflict Exception', statusCode: 409 });
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
			expect(exception.getResponse()).toEqual({ error: 'Not Found', message: 'New NotFound Exception', statusCode: 404 });
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
			expect(exception.getResponse()).toEqual({ error: 'Service Unavailable', message: 'New Integration Exception', statusCode: 503 });
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
			expect(exception.getResponse()).toEqual({ error: 'Internal Server Error', message: 'New Internal Exception', statusCode: 500 });
		});
	});
});
