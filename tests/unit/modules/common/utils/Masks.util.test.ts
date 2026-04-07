import { StreamableFile } from '@nestjs/common';
import { maskBuffer, maskObjectSensitiveData } from '@common/utils/masks.util';

describe('Modules :: Common :: Utils :: Masks', () => {
	describe('# maskObjectSensitiveData', () => {
		test('Should return null when data is not an object', () => {
			expect(maskObjectSensitiveData('string' as unknown as object)).toBeNull();
			expect(maskObjectSensitiveData(123 as unknown as object)).toBeNull();
		});

		test('Should return null when data is null', () => {
			expect(maskObjectSensitiveData(null as unknown as object)).toBeNull();
		});

		test('Should return null when data is undefined', () => {
			expect(maskObjectSensitiveData(undefined as unknown as object)).toBeNull();
		});

		test('Should return the original data when no sensitive fields are present', () => {
			const data = { name: 'John', email: 'john@example.com' };

			const result = maskObjectSensitiveData(data);

			expect(result).toBe(data);
		});

		test('Should return a cloned object with the "password" field masked', () => {
			const data = { username: 'john', password: 'secret123' };

			const result = maskObjectSensitiveData(data);

			expect(result).toEqual({ username: 'john', password: '***' });
			expect(result).not.toBe(data);
		});

		test('Should mask all sensitive fields when multiple are present', () => {
			const data = { password: 'pass', newPassword: 'newpass', cvv: '123', pin: '4321', token: 'abc' };

			const result = maskObjectSensitiveData(data);

			expect(result).toEqual({ password: '***', newPassword: '***', cvv: '***', pin: '***', token: '***' });
		});

		test('Should mask sensitive fields in nested objects', () => {
			const data = { user: { name: 'John', password: 'secret' } };

			const result = maskObjectSensitiveData(data);

			expect(result).toEqual({ user: { name: 'John', password: '***' } });
		});
	});

	describe('# maskBuffer', () => {
		test('Should return "[StreamableFile]" for a StreamableFile instance', () => {
			const file = new StreamableFile(Buffer.from('data'));

			expect(maskBuffer(file)).toBe('[StreamableFile]');
		});

		test('Should return "[ArrayBuffer]" for an ArrayBuffer instance', () => {
			const arrayBuffer = new ArrayBuffer(8);

			expect(maskBuffer(arrayBuffer)).toBe('[ArrayBuffer]');
		});

		test('Should return "[Buffer]" for a Buffer instance', () => {
			const buffer = Buffer.from('data');

			expect(maskBuffer(buffer)).toBe('[Buffer]');
		});

		test('Should return null for an unrecognized type', () => {
			expect(maskBuffer('string' as unknown as Buffer)).toBeNull();
		});
	});
});
