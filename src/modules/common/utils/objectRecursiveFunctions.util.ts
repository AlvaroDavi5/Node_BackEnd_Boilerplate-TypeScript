import { isNullOrUndefined, getObjKeys } from './dataValidations.util';


export function cloneObject<OT extends object = object>(obj: OT): OT {
	try {
		return structuredClone(obj);
	} catch (error) {
		const newObj = {} as OT;

		Object.keys(obj).forEach((key) => {
			let value = obj[key as keyof OT];

			if (typeof value === 'object' && !!value && !Array.isArray(value))
				value = cloneObject(value);

			newObj[key as keyof OT] = value;
		});

		return newObj;
	}
}

export function checkFieldsExistence<OT extends object = object>(obj: OT, fieldsToApply: (keyof OT)[]): boolean {
	if (isNullOrUndefined(obj))
		return false;

	const callback = (payload: OT): boolean => {
		const payloadKeys = getObjKeys<OT>(payload);
		return payloadKeys.some((key): boolean => fieldsToApply.includes(key));
	};

	let result = false;
	result = callback(obj);
	if (result === true)
		return result;

	const objectKeys = getObjKeys<OT>(obj);
	objectKeys.forEach((key) => {
		const value = obj[key as keyof OT];

		if (value && typeof value === 'object')
			result = checkFieldsExistence(value as OT, fieldsToApply);
	});

	return result;
}

export function replaceFields<OT extends object = object>(obj: OT, fieldsToApply: (keyof OT)[], valueToReplace: unknown): OT | null {
	if (isNullOrUndefined(obj))
		return null;

	const callback = (payload: OT) => {
		fieldsToApply.forEach((key) => {
			if (payload[String(key) as keyof OT] !== undefined) {
				payload[String(key) as keyof OT] = valueToReplace as OT[keyof OT];
			}
		});

		return payload;
	};

	const objectKey = getObjKeys(obj);
	objectKey.forEach((key) => {
		const value = obj[key as keyof OT];

		if (value && typeof value === 'object')
			replaceFields(value as OT, fieldsToApply, valueToReplace);
	});

	return callback(obj);
}
