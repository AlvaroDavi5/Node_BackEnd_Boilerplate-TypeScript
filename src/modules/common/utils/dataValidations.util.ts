
export function isDefined<T = unknown>(value: T | undefined): value is T {
	return value !== undefined;
}

export function isNull(value: unknown | null): value is null {
	return value === null;
}

export function isNullOrUndefined<T = unknown>(value: T): value is T & (null | undefined) {
	return isNull(value) || !isDefined(value);
}

export function isEmpty(data: unknown): boolean {
	if (typeof data === 'string')
		return data.length <= 0;

	if (Array.isArray(data))
		return data.length <= 0;

	if (typeof data === 'object') {
		if (isNullOrUndefined(data))
			return true;

		return Object.keys(data as object).length <= 0;
	}

	return true;
}

export function getObjKeys<OT = unknown>(obj: OT): (keyof OT)[] {
	if (isNullOrUndefined(obj))
		return [] as unknown as (keyof OT)[];

	return Object.keys(obj as object) as (keyof OT)[];
}

export function getObjValues<VT = unknown>(obj: unknown): VT[] {
	if (isNullOrUndefined(obj))
		return [];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return Object.values<VT>(obj as any);
}
