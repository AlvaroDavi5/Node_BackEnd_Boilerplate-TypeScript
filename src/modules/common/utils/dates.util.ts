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
export function fromEpochToDateTime(epoch: number, milliseconds: boolean, timeZone: TimeZonesEnum): DateTime {
	if (milliseconds)
		return DateTime.fromMillis(epoch, { zone: timeZone });
	else
		return DateTime.fromSeconds(epoch, { zone: timeZone });
}
export function fromDateTimeToEpoch(dateTime: DateTime, milliseconds: boolean, utc = false): number {
	const epochDateTime = utc
		? dateTime.toUTC()
		: dateTime;

	if (milliseconds)
		return epochDateTime.toMillis();
	else
		return epochDateTime.toSeconds();
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

export function secondsToMilliseconds(s: number): number {
	return (s ?? 0) * 1000;
}

export function minutesToSeconds(n: number): number {
	return (n ?? 0) * 60;
}

export function hoursToSeconds(n: number): number {
	return minutesToSeconds((n ?? 0) * 60);
}

export function daysToSeconds(n: number): number {
	return hoursToSeconds((n ?? 0) * 24);
}
