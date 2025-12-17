import { DateTime } from 'luxon';
import { fromISOToDateTime, fromDateTimeToJSDate, getDateTimeNow } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';


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

	protected exists(value: unknown): boolean {
		return !isNullOrUndefined(value);
	}

	protected getDate(strDate?: string): Date {
		const date: DateTime = strDate?.length
			? fromISOToDateTime(strDate, false, TimeZonesEnum.America_SaoPaulo)
			: getDateTimeNow(TimeZonesEnum.America_SaoPaulo);

		return fromDateTimeToJSDate(date, true);
	}

	public getAttributes(): I {
		return {} as I;
	}
}
