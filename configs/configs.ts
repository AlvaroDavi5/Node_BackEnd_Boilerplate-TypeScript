import dotenv from 'dotenv';
import staticConfigs from './staticConfigs.json';
dotenv.config();

function convert(config: object | any) {
	const result: any = {};

	Object.keys(config).forEach(name => {
		let value = config[name];

		if (typeof (value) === 'object' && value !== null) {
			value = convert(value);
		}

		if (typeof (value) === 'string' && value.indexOf('$') > -1) {
			const key = value.replace(/\$/g, '');

			if (process.env[key]) {
				value = process.env[key];
			}
			else {
				value = undefined;
			}
		}

		result[name] = value;
	});

	return result;
}


export default convert(staticConfigs);
