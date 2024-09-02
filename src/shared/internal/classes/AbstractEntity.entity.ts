import { DateTime } from 'luxon';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { fromISOToDateTime, fromDateTimeToJSDate, getDateTimeNow } from '@common/utils/dates.util';


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

	public exists(value: unknown): boolean {
		return (value !== undefined && value !== null);
	}

	public getDate(strDate?: string): Date {
		const date: DateTime = strDate?.length
			? fromISOToDateTime(strDate, false, TimeZonesEnum.SaoPaulo)
			: getDateTimeNow(TimeZonesEnum.SaoPaulo);

		return fromDateTimeToJSDate(date, true);
	}

	public getAttributes(): I {
		return {} as I;
	}
}
