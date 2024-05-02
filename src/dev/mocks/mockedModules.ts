import { v4 as uuidV4 } from 'uuid';
import configs from 'src/modules/core/configs/configs.config';
import { LoggerProviderInterface } from '@core/infra/logging/Logger.provider';


export const configServiceMock = {
	get: (propertyPath?: string): any => {
		if (propertyPath) {
			const splitedPaths = propertyPath.split('.');
			let scopedProperty: any = configs();

			for (let i = 0; i < splitedPaths.length; i++) {
				const scopedPath = splitedPaths[i];

				if (scopedPath.length)
					scopedProperty = scopedProperty[scopedPath];
			}

			return scopedProperty;
		}
		else
			return configs();
	},
};

export const cryptographyServiceMock = {
	generateUuid: (): string => {
		return uuidV4();
	}
};

export const loggerProviderMock: LoggerProviderInterface = {
	getLogger: (context: string): any => {
		return {
			error: console.error,
			warn: console.warn,
			info: console.info,
			debug: console.debug,
			log: console.log,
		};
	}
};

export const dataParserHelperMock = {
	toString: (data: unknown = {}): string => {
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
			result = (JSON.stringify(data) || data?.toString()) ?? '';
			break;
		case 'symbol':
			result = data.toString();
			break;
		default:
			result = '';
			break;
		}

		return result;
	},
};
