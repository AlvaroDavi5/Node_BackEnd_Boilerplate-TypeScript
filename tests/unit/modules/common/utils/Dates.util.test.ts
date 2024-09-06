import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import {
	fromISOToDateTime, fromEpochToDateTime, fromJSDateToDateTime,
	fromDateTimeToISO, fromDateTimeToEpoch, fromDateTimeToJSDate,
	getDateTimeNow, setDateUnits, formatDateTime,
} from '@common/utils/dates.util';


describe('Modules :: Common :: Utils :: Dates', () => {
	const timestamp = fromISOToDateTime('2024-06-10T05:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);

	describe('# Parse and Format', () => {
		test('Should parse JSDate', () => {
			const dateTime = fromJSDateToDateTime(new Date('2024-06-10T05:52:50.885Z'), TimeZonesEnum.America_SaoPaulo);
			const jsDate = fromDateTimeToJSDate(dateTime, false);

			const utcISODateTime = fromDateTimeToISO(dateTime, true);
			const utcISOJsDate = jsDate.toISOString();

			expect(utcISODateTime).toBe('2024-06-10T05:52:50.885Z');
			expect(utcISODateTime).toBe(utcISOJsDate);
		});

		test('Should parse Epoch (milliseconds)', () => {
			const dateTime = fromISOToDateTime('2024-06-10T05:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);

			const gmtEpoch = fromDateTimeToEpoch(dateTime, true, false);
			const gmtDateTime = fromEpochToDateTime(gmtEpoch, true, TimeZonesEnum.America_SaoPaulo);

			expect(fromDateTimeToISO(gmtDateTime, false)).toBe('2024-06-10T02:52:50.885-03:00');
		});

		test('Should parse Epoch (seconds)', () => {
			const dateTime = fromISOToDateTime('2024-06-10T05:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);

			const gmtEpoch = fromDateTimeToEpoch(dateTime, false, false);
			const gmtDateTime = fromEpochToDateTime(gmtEpoch, false, TimeZonesEnum.America_SaoPaulo);

			expect(fromDateTimeToISO(gmtDateTime, false)).toBe('2024-06-10T02:52:50.885-03:00');
		});

		test('Should parse ISO', () => {
			const dateTime = fromISOToDateTime('2024-06-10T05:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
			const gmtIsoDate = fromDateTimeToISO(dateTime, false);
			const utcIsoDate = fromDateTimeToISO(dateTime, true);

			expect(gmtIsoDate).toBe('2024-06-10T02:52:50.885-03:00');
			expect(utcIsoDate).toBe('2024-06-10T05:52:50.885Z');
		});

		test('Should format', () => {
			const dateTime = fromISOToDateTime('2024-06-10T05:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
			const brDate = formatDateTime(dateTime, 'dd/MM/yyyy HH:mm:ss');

			expect(brDate).toBe('10/06/2024 02:52:50');
		});
	});

	describe('# Units, UTC and TimeZones', () => {
		test('Should differ units', () => {
			const dateNow = getDateTimeNow(TimeZonesEnum.America_SaoPaulo);
			const dateTime = fromISOToDateTime('2024-06-10T05:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
			const d1 = setDateUnits(dateTime, { minute: 25, year: 2027 });
			const d2 = setDateUnits(dateTime, { hour: 24, month: 7 });

			expect(dateNow.millisecond).not.toBe(dateTime.millisecond);
			expect(d1.minute).not.toBe(dateTime.minute);
			expect(d1.second).toBe(dateTime.second);
			expect(d1.year).not.toBe(dateTime.year);
			expect(d2.minute).toBe(dateTime.minute);
			expect(d2.second).toBe(dateTime.second);
			expect(d2.day).not.toBe(dateTime.day);
			expect(d2.month).not.toBe(dateTime.month);
			expect(d2.year).toBe(dateTime.year);
		});

		test('Should differ by UTC', () => {
			const zonedISODate = fromDateTimeToISO(timestamp, false);
			const utcISODate = fromDateTimeToISO(timestamp, true);

			expect(zonedISODate).toBe('2024-06-10T02:52:50.885-03:00');
			expect(utcISODate).toBe('2024-06-10T05:52:50.885Z');
		});

		test('Should differ by TimeZone', () => {
			const utcDate = '2024-06-10T05:52:50.885Z';
			const spISODate = fromDateTimeToISO(fromISOToDateTime(utcDate, false, TimeZonesEnum.America_SaoPaulo), false);
			const nyISODate = fromDateTimeToISO(fromISOToDateTime(utcDate, false, TimeZonesEnum.America_NewYork), false);

			expect(spISODate).toBe('2024-06-10T02:52:50.885-03:00');
			expect(nyISODate).toBe('2024-06-10T01:52:50.885-04:00');
		});
	});
});
