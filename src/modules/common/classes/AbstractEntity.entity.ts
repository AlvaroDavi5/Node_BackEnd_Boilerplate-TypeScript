import { fromISOToDateTime, fromDateTimeToJSDate, getDateTimeNow } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';


export default abstract class AbstractEntity<I = unknown> {

	public validate(): { value: unknown, valid: boolean, error: Error | null } {
		let value: unknown = null;
		let valid = false;
		let error: Error | null = null;

		if (this instanceof AbstractEntity) {
			valid = true;
			value = { ...this };
		} else {
			error = new Error('Invalid Entity');
		}

		return { value, valid, error };
	}

	protected getDate(dateValue?: unknown): Date {
		const setUTC = true;

		if (dateValue instanceof Date) {
			return dateValue;
		} else if (typeof dateValue === 'string') {
			const dateTime = fromISOToDateTime(dateValue, false, TimeZonesEnum.America_SaoPaulo);
			return fromDateTimeToJSDate(dateTime, setUTC);
		}

		return fromDateTimeToJSDate(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), setUTC);
	}

	public getAttributes(): I {
		return {} as I;
	}
}
