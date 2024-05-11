
export function checkFields(obj: any, fieldsToApply: string[]): boolean {
	let result = false;

	const callback = (payload: any): boolean => {
		const payloadKeys = Object.keys(payload);
		return payloadKeys.some((key: string): boolean => fieldsToApply.includes(key));
	};
	result = callback(obj);
	if (result)
		return result;

	const objectKey = Object.keys(obj);
	objectKey.forEach((key: string): void => {
		const value = obj[key];

		if (value && typeof value === 'object')
			result = checkFields(value, fieldsToApply);
	});

	return result;
}

export function replaceFields(obj: any, fieldsToApply: string[]): any {
	const callback = (payload: any) => {
		fieldsToApply.forEach((key: string) => {
			if (payload[key] !== undefined) {
				payload[key] = '***';
			}
		});

		return payload;
	};

	const objectKey = Object.keys(obj);
	objectKey.forEach((key: string): void => {
		const value = obj[key];

		if (value && typeof value === 'object')
			replaceFields(value, fieldsToApply);
	});

	return callback(obj);
}
