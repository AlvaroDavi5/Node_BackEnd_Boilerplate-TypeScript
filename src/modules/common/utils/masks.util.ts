import { StreamableFile } from '@nestjs/common';
import { checkFieldsExistence, replaceFields, cloneObject } from './objectRecursiveFunctions.util';
import { isDefined, isNull } from './dataValidations.util';


const SENSITIVE_DATA_FIELDS: string[] = ['password', 'newPassword', 'cvv', 'pin', 'token'];
const STRING_TO_REPLACE: string = '***';

export function maskObjectSensitiveData(data: object): object | null {
	if (typeof data !== 'object' || isNull(data) || !isDefined(data)) {
		return null;
	}

	const hasSensitiveData: boolean = checkFieldsExistence(data, SENSITIVE_DATA_FIELDS as (keyof object)[]);
	if (hasSensitiveData) {
		const newData = cloneObject(data);
		return replaceFields(newData, SENSITIVE_DATA_FIELDS as (keyof object)[], STRING_TO_REPLACE);
	}

	return data;
}

export function maskBuffer(responseData: StreamableFile | ArrayBuffer | Buffer): string | null {
	if (responseData instanceof StreamableFile)
		return '[StreamableFile]';
	if (responseData instanceof ArrayBuffer)
		return '[ArrayBuffer]';
	if (Buffer.isBuffer(responseData))
		return '[Buffer]';

	return null;
}
