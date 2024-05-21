import { readFileSync } from 'fs';
import { join } from 'path';


interface PackageInfoInterface {
	name?: string,
	description?: string,
	version?: string,
	license?: string,
	author?: string,
	contributors?: string[],
	main?: string,
	repository?: {
		type?: string,
		url?: string,
		ssh?: string,
	},
	private?: boolean,
	os?: string[],
	engines?: {
		node?: string,
		yarn?: string,
	},
	keywords?: string[],
}

export default function readPackageInfo(): PackageInfoInterface {
	const fileName = 'package.json';

	try {
		const content = readFileSync(join(process.cwd(), fileName), { encoding: 'utf8' });
		return JSON.parse(content);
	} catch (error) {
		console.error(`Error to read file ${fileName}`, error);

		return {};
	}
}

