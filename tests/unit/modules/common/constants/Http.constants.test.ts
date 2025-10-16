import HttpMessagesConstants from '@common/constants/HttpMessages.constants';


describe('Modules :: Common :: Constants :: HttpMessagesConstants', () => {
	const httpMessagesConstants = new HttpMessagesConstants();

	describe('# Messages', () => {
		test('Should return the same value', () => {
			expect(httpMessagesConstants.messages.found('Resource')).toBe('Resource founded successfully.');
			expect(httpMessagesConstants.messages.notFound('Resource')).toBe('Resource not found!');
			expect(httpMessagesConstants.messages.created('Resource')).toBe('Resource created successfully.');
			expect(httpMessagesConstants.messages.notCreated('Resource')).toBe('Error to create Resource!');
			expect(httpMessagesConstants.messages.updated('Resource')).toBe('Resource updated successfully.');
			expect(httpMessagesConstants.messages.notUpdated('Resource')).toBe('Error to update Resource!');
			expect(httpMessagesConstants.messages.deleted('Resource')).toBe('Resource deleted successfully.');
			expect(httpMessagesConstants.messages.notDeleted('Resource')).toBe('Error to delete Resource!');
			expect(httpMessagesConstants.messages.badRequest('Request')).toBe('Request is invalid!');
			expect(httpMessagesConstants.messages.unauthorized('Request')).toBe('Request is unauthorized!');
			expect(httpMessagesConstants.messages.forbidden('Request')).toBe('Request is forbidden!');
			expect(httpMessagesConstants.messages.conflict('Resource')).toBe('Resource already exists!');
			expect(httpMessagesConstants.messages.notAcceptable('Request')).toBe('Request is not acceptable!');
			expect(httpMessagesConstants.messages.notImplemented('Method')).toBe('Method is not implemented!');
			expect(httpMessagesConstants.messages.serviceUnavailable('Service')).toBe('Service is unavailable!');
			expect(httpMessagesConstants.messages.unrecognizedError()).toBe('Unrecognized error!');
		});
	});
});
