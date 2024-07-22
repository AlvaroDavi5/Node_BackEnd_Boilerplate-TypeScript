import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';


type TimeFormat = 'iso-8601' | 'jsDate';

@Injectable()
export default class DateGeneratorHelper {
	public getDate(date: Date | string, format?: TimeFormat, utc = true, timeZone: TimeZonesEnum = TimeZonesEnum.SaoPaulo): Date {
		const isStringDate = typeof date === 'string';
		const dateTime = isStringDate
			? this.getDateFromString(date, format)
			: DateTime.fromJSDate(date);

		const dateTimeWithZone = utc ? dateTime.toUTC() : dateTime.setZone(timeZone);

		return dateTimeWithZone.toJSDate();
	}

	private getDateFromString(strDate: string, format?: TimeFormat): DateTime {
		let datetime: DateTime;

		switch (format) {
			case 'iso-8601':
				datetime = DateTime.fromISO(strDate);
				break;
			default:
				datetime = DateTime.fromJSDate(new Date(strDate));
				break;
		}

		return datetime;
	}
}
