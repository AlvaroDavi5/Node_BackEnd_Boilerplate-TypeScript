import { DateTime, DateObjectUnits } from 'luxon';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';


// SECTION - date parse

// STUB - JS Date
export function fromJSDateToDateTime(jsDate: Date, timeZone: TimeZonesEnum): DateTime {
	return DateTime.fromJSDate(jsDate, { zone: timeZone });
}
export function fromDateTimeToJSDate(dateTime: DateTime, utc = false): Date {
	if (utc)
		return dateTime.toUTC().toJSDate();
	return dateTime.toJSDate();
}

// STUB - Unix Epoch
export function fromEpochToDateTime(epochSeconds: number, timeZone: TimeZonesEnum): DateTime {
	return DateTime.fromSeconds(epochSeconds, { zone: timeZone });
}
export function fromDateTimeToEpoch(dateTime: DateTime, utc = false): number {
	if (utc)
		return dateTime.toUTC().toUnixInteger();
	return dateTime.toUnixInteger();
}

// STUB - ISO Date
export function fromISOToDateTime(isoString: string, useStrZone: boolean, timeZone: TimeZonesEnum): DateTime {
	return DateTime.fromISO(isoString, { setZone: useStrZone, zone: timeZone });
}
export function fromDateTimeToISO(dateTime: DateTime, utc = false): string {
	if (utc)
		return dateTime.toUTC().toISO() ?? '';
	return dateTime.toISO() ?? '';
}
// !SECTION

export function formatDateTime(dateTime: DateTime, format: string): string {
	return dateTime.toFormat(format);
}

export function getDateTimeNow(timeZone: TimeZonesEnum): DateTime {
	return DateTime.now().setZone(timeZone);
}

export function setDateUnits(dateTime: DateTime, units: DateObjectUnits): DateTime {
	const isoDate = fromDateTimeToISO(dateTime.set(units), false);
	return fromISOToDateTime(isoDate, true, dateTime.zone.name as TimeZonesEnum);
}
