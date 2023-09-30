
export default abstract class AbstractEntity {
	public validate(): { value: any, valid: boolean, error: Error | null } {
		let value: any = null;
		let valid = false;
		let error: Error | null = null;

		if (this instanceof AbstractEntity) {
			valid = true;
			value = { ...this };
		}
		else {
			error = new Error('Invalid Entity');
		}

		return { value, valid, error };
	}

	public exists(value: any): boolean {
		if (value !== undefined && value !== null)
			return true;
		return false;
	}

	public getAttributes(): any {
		return {};
	}
}
