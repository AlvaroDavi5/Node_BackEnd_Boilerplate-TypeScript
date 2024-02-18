import { Injectable } from '@nestjs/common';


@Injectable()
export default class DateGeneratorHelper {
	public getDate(withoutTimezone = true, dateStr?: string): Date {
		const date = dateStr ? new Date(dateStr) : new Date();
		const strDate = date.toISOString();

		return new Date(withoutTimezone ? strDate.slice(0, -1) : strDate);
	}
}
