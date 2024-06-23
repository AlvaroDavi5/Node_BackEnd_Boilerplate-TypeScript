import { isNullOrUndefined, isEmpty, getObjKeys, getObjValues } from '@common/utils/dataValidations.util';
import { checkFields, replaceFields } from '@common/utils/objectRecursiveFunctions.util';


describe('Modules :: Common :: Utils :: DataUtils', () => {
	describe('# Data Validations', () => {
		test('Check nullish and definition', () => {
			expect(isNullOrUndefined(null)).toBeTruthy();
			expect(isNullOrUndefined(undefined)).toBeTruthy();
			expect(isNullOrUndefined({})).toBeFalsy();
		});

		test('Check if is empty', () => {
			expect(isEmpty(undefined)).toBeTruthy();
			expect(isEmpty('')).toBeTruthy();
			expect(isEmpty('test')).toBeFalsy();
			expect(isEmpty([])).toBeTruthy();
			expect(isEmpty([1, 2])).toBeFalsy();
			expect(isEmpty({})).toBeTruthy();
			expect(isEmpty({ key: 'value' })).toBeFalsy();
		});


		test('Get object keys and values', () => {
			expect(getObjKeys(null)).toEqual([]);
			expect(getObjValues(null)).toEqual([]);
			const obj = { key1: 'value1' };
			expect(getObjKeys(obj)).toEqual(['key1']);
			expect(getObjValues(obj)).toEqual(['value1']);
		});
	});

	describe('# Object Recursive Functions', () => {
		test('Should check fields', () => {
			expect(checkFields(null, ['key2'])).toBeFalsy();
			expect(checkFields({ key1: 'value1' }, ['key2'])).toBeFalsy();
			expect(checkFields({ key2: 'value2' }, ['key2'])).toBeTruthy();
		});

		test('Should replace fields', () => {
			expect(replaceFields(undefined, ['key2'])).toBeNull();
			expect(replaceFields({ key1: 'value1' }, ['key2'], 'xxx')).toEqual({ key1: 'value1' });
			expect(replaceFields({ key2: 'value2' }, ['key2'], 'xxx')).toEqual({ key2: 'xxx' });
		});
	});
});
