
export function isNullOrUndefined(data: any): boolean {
	return data === null || data === undefined;
}

export function isEmpty(data: any): boolean {
	if (typeof data === 'string')
		return data.length <= 0;

	if (Array.isArray(data))
		return data.length <= 0;

	if (typeof data === 'object') {
		if (isNullOrUndefined(data))
			return true;

		return Object.keys(data).length <= 0;
	}

	return true;
}

export function getObjKeys(obj: any): string[] {
	if (isNullOrUndefined(obj))
		return [];

	return Object.keys(obj);
}

export function getObjValues<T = any>(obj: any): T[] {
	if (isNullOrUndefined(obj))
		return [];

	return Object.values<T>(obj);
}
