import HttpConstants from '@common/constants/Http.constants';


describe('Modules :: Common :: Constants :: HttpConstants', () => {
	const httpConstants = new HttpConstants();

	describe('# Messages', () => {
		test('Should return the same value', () => {
			expect(httpConstants.messages.found('Resource')).toBe('Resource founded successfully.');
			expect(httpConstants.messages.notFound('Resource')).toBe('Resource not found!');
			expect(httpConstants.messages.created('Resource')).toBe('Resource created successfully.');
			expect(httpConstants.messages.notCreated('Resource')).toBe('Error to create Resource!');
			expect(httpConstants.messages.updated('Resource')).toBe('Resource updated successfully.');
			expect(httpConstants.messages.notUpdated('Resource')).toBe('Error to update Resource!');
			expect(httpConstants.messages.deleted('Resource')).toBe('Resource deleted successfully.');
			expect(httpConstants.messages.notDeleted('Resource')).toBe('Error to delete Resource!');
			expect(httpConstants.messages.badRequest('Request')).toBe('Request is invalid!');
			expect(httpConstants.messages.unauthorized('Request')).toBe('Request is unauthorized!');
			expect(httpConstants.messages.forbidden('Request')).toBe('Request is forbidden!');
			expect(httpConstants.messages.conflict('Resource')).toBe('Resource already exists!');
			expect(httpConstants.messages.notAcceptable('Request')).toBe('Request is not acceptable!');
			expect(httpConstants.messages.notImplemented('Method')).toBe('Method is not implemented!');
			expect(httpConstants.messages.serviceUnavailable('Service')).toBe('Service is unavailable!');
			expect(httpConstants.messages.unrecognizedError()).toBe('Unrecognized error!');
		});
	});
});
