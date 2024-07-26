import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';


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
		const dateGeneratorHelper: DateGeneratorHelper = new DateGeneratorHelper();
		return dateGeneratorHelper.getDate(strDate ?? new Date().toISOString(), 'iso-8601', true);
	}

	public getAttributes(): I {
		return {} as I;
	}
}
