import { BadGatewayException, BadRequestException, GoneException, NotFoundException } from '@nestjs/common';
import externalErrorParser from '@common/utils/externalErrorParser.util';


describe('Modules :: Common :: Utils :: ExternalErrorParser', () => {
	describe('# Parse error to known error', () => {
		test('500 to 500', () => {
			const error = externalErrorParser(new Error('Test Error'));
			expect(error.getStatus()).toBe(500);
		});
		test('400 to 400', () => {
			const error = externalErrorParser(new BadRequestException('Test Error'));
			expect(error.getStatus()).toBe(400);
		});
		test('404 to 404', () => {
			const error = externalErrorParser(new NotFoundException('Test Error'));
			expect(error.getStatus()).toBe(404);
		});
		test('410 to 500', () => {
			const error = externalErrorParser(new GoneException('Test Error'));
			expect(error.getStatus()).toBe(500);
		});
		test('502 to 500', () => {
			const error = externalErrorParser(new BadGatewayException('Test Error'));
			expect(error.getStatus()).toBe(500);
		});
	});
});
