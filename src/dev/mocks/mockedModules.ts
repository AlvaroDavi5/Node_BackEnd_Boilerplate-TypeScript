import { v4 as uuidV4 } from 'uuid';
import configs from 'src/modules/core/configs/configs.config';
import { LoggerInterface } from 'src/modules/core/logging/logger';


export const configServiceMock = {
	get: (propertyPath?: string): any => {
		if (propertyPath) {
			const splitedPaths = propertyPath.split('.');
			let scopedProperty: any = configs();

			for (const scopedPath of splitedPaths) {
				if (scopedPath.length)
					scopedProperty = scopedProperty[scopedPath];
			}

			return scopedProperty;
		} else
			return configs();
	},
};

export const cryptographyServiceMock = {
	generateUuid: (): string => {
		return uuidV4();
	}
};

export const loggerProviderMock: LoggerInterface & {
	setContextName: (context: string) => void,
	setRequestId: (requestId: string) => void,
} = {
	error: console.error,
	warn: console.warn,
	info: console.info,
	http: console.info,
	verbose: console.log,
	debug: console.debug,
	setContextName: (context: string) => { context.trim(); },
	setRequestId: (requestId: string) => { requestId.trim(); },
};

export const dataParserHelperMock = {
	toString: (data: unknown): string => {
		let result = null;

		switch (typeof data) {
		case 'bigint':
			result = data.toString();
			break;
		case 'number':
			result = data.toString();
			break;
		case 'boolean':
			result = data.toString();
			break;
		case 'string':
			result = data;
			break;
		case 'object':
			if (!data)
				result = '';
			else
				result = (JSON.stringify(data) || data?.toString()) ?? '';
			break;
		case 'symbol':
			result = data.toString();
			break;
		case 'function':
			result = data.toString();
			break;
		default:
			result = '';
			break;
		}

		return result;
	},

	toObject: (data: string): object | null => {
		try {
			return JSON.parse(data);
		} catch (error) {
			return null;
		}
	}
};
