import { Injectable } from '@nestjs/common';


@Injectable()
export default class DateGeneratorHelper {
	public getDate(utc = true, dateStr?: string): Date {
		const date = dateStr ? new Date(dateStr) : new Date();
		const utcDate = new Date(date.toUTCString());

		return utc ? utcDate : date;
	}
}
