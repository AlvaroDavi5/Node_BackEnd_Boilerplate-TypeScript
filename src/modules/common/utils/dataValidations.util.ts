
export function isNullOrUndefined(data: unknown): boolean {
	return data === null || data === undefined;
}

export function isEmpty(data: unknown): boolean {
	if (typeof data === 'string')
		return data.length <= 0;

	if (Array.isArray(data))
		return data.length <= 0;

	if (typeof data === 'object') {
		if (isNullOrUndefined(data))
			return true;

		return Object.keys(data as any).length <= 0;
	}

	return true;
}

export function getObjKeys<OT = any>(obj: OT): Array<keyof OT> {
	if (isNullOrUndefined(obj))
		return [] as unknown as Array<keyof OT>;

	return Object.keys(obj as any) as Array<keyof OT>;
}

export function getObjValues<VT = any>(obj: unknown): VT[] {
	if (isNullOrUndefined(obj))
		return [];

	return Object.values<VT>(obj as any);
}
