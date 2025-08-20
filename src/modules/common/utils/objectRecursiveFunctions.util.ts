import { isNullOrUndefined, getObjKeys } from './dataValidations.util';


export function cloneObject<OT extends object = object>(obj: OT): OT {
	try {
		return structuredClone(obj);
	} catch (_error) {
		const newObj = {} as OT;

		getObjKeys<OT>(obj).forEach((key) => {
			let value = obj[String(key) as keyof OT];

			if (typeof value === 'object' && value && !Array.isArray(value))
				value = cloneObject(value);

			newObj[String(key) as keyof OT] = value;
		});

		return newObj;
	}
}

function hasFieldsAtCurrentObjectLevel<OT extends object = object>(obj: OT, fieldsToApply: (keyof OT)[]): boolean {
	const objectKeys = getObjKeys<OT>(obj);
	return objectKeys.some((key): boolean => fieldsToApply.includes(key),
	);
}

export function checkFieldsExistence<OT extends object = object>(obj: OT, fieldsToApply: (keyof OT)[]): boolean {
	if (isNullOrUndefined(obj))
		return false;

	if (hasFieldsAtCurrentObjectLevel(obj, fieldsToApply))
		return true;

	const objectKeys = getObjKeys<OT>(obj);
	for (const key of objectKeys) {
		const value = obj[String(key) as keyof OT];

		if (value && typeof value === 'object') {
			if (Array.isArray(value)) {
				const hasFieldInArray = value.some((item) => checkFieldsExistence(item as OT, fieldsToApply));
				if (hasFieldInArray)
					return true;
			} else {
				if (checkFieldsExistence(value as OT, fieldsToApply))
					return true;
			}
		}
	}

	return false;
}

function applyFieldReplacement<OT extends object = object>(obj: OT, fieldsToApply: (keyof OT)[], valueToReplace: unknown): OT {
	fieldsToApply.forEach((key) => {
		if (obj[String(key) as keyof OT] !== undefined) {
			obj[String(key) as keyof OT] = valueToReplace as OT[keyof OT];
		}
	});

	return obj;
}

export function replaceFields<OT extends object = object>(obj: OT, fieldsToApply: (keyof OT)[], valueToReplace: unknown): OT | null {
	if (isNullOrUndefined(obj))
		return null;

	const objectKeys = getObjKeys<OT>(obj);
	for (const key of objectKeys) {
		const value = obj[String(key) as keyof OT];

		if (value && typeof value === 'object') {
			if (Array.isArray(value)) {
				value.forEach((item) => {
					if (item && typeof item === 'object') {
						replaceFields(item as OT, fieldsToApply, valueToReplace);
					}
				});
			} else {
				replaceFields(value as OT, fieldsToApply, valueToReplace);
			}
		}
	}

	return applyFieldReplacement(obj, fieldsToApply, valueToReplace);
}
