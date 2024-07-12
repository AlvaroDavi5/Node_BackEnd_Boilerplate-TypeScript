import { isNullOrUndefined, getObjKeys } from './dataValidations.util';


export function checkFields(obj: any, fieldsToApply: string[]): boolean {
	if (isNullOrUndefined(obj))
		return false;

	let result = false;

	const callback = (payload: any): boolean => {
		const payloadKeys = getObjKeys(payload);
		return payloadKeys.some((key: string): boolean => fieldsToApply.includes(key));
	};
	result = callback(obj);
	if (result)
		return result;

	const objectKey = getObjKeys(obj);
	objectKey.forEach((key: string): void => {
		const value = obj[key];

		if (value && typeof value === 'object')
			result = checkFields(value, fieldsToApply);
	});

	return result;
}

export function replaceFields(obj: any, fieldsToApply: string[], valueToReplace: string): any {
	if (isNullOrUndefined(obj))
		return null;

	const callback = (payload: any) => {
		fieldsToApply.forEach((key: string) => {
			if (payload[key] !== undefined) {
				payload[key] = valueToReplace;
			}
		});

		return payload;
	};

	const objectKey = getObjKeys(obj);
	objectKey.forEach((key: string): void => {
		const value = obj[key];

		if (value && typeof value === 'object')
			replaceFields(value, fieldsToApply, valueToReplace);
	});

	return callback(obj);
}
