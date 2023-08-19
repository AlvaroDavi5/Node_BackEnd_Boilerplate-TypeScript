
export default abstract class Entity {
	public validate(): { value: any, valid: boolean, error: Error | null } {
		let value: any = null;
		let valid = false;
		let error: Error | null = null;

		if (this instanceof Entity) {
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
