import { Injectable } from '@nestjs/common';


@Injectable()
export default class CacheAccessHelper {
	public generateKey(id: string, keyPattern = ''): string {
		return `${keyPattern}:${id}`;
	}

	public getId(key: string, keyPattern = ''): string {
		return key.replace(`${keyPattern}:`, '');
	}
}
