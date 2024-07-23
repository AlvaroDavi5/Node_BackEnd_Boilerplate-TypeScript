import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';


describe('Modules :: Common :: Utils :: Helpers :: DateGeneratorHelper', () => {
	const dateGeneratorHelper = new DateGeneratorHelper();

	describe('# Get UTC Date', () => {
		const timestamp = new Date('2024-06-10T03:52:50.885Z');

		test('Should return JSDate from ISO date string', () => {
			const date = dateGeneratorHelper.getDate(timestamp.toISOString(), 'iso-8601', true, TimeZonesEnum.SaoPaulo);
			expect(date.toISOString()).toBe('2024-06-10T03:52:50.885Z');
		});

		test('Should return JSDate from JSDate string', () => {
			const date = dateGeneratorHelper.getDate(timestamp.toString(), 'jsDate', true, TimeZonesEnum.SaoPaulo);
			expect(date.toISOString()).toBe('2024-06-10T03:52:50.000Z');
		});

		test('Should return JSDate from JSDate', () => {
			const date = dateGeneratorHelper.getDate(timestamp, 'jsDate', true, TimeZonesEnum.SaoPaulo);
			expect(date.toISOString()).toBe('2024-06-10T03:52:50.885Z');
		});
	});

	describe('# Get Date by TimeZone', () => {
		const timestamp = '2024-06-10T03:52:50.885Z';

		test('Should return different dates', () => {
			const dateSP = dateGeneratorHelper.getDate(timestamp, 'iso-8601', false, TimeZonesEnum.SaoPaulo);
			expect(dateSP.toISOString()).toBe('2024-06-10T03:52:50.885Z');

			const dateNY = dateGeneratorHelper.getDate(timestamp, 'iso-8601', false, TimeZonesEnum.NewYork);
			expect(dateNY.toISOString()).toBe('2024-06-10T03:52:50.885Z');
		});
	});
});
