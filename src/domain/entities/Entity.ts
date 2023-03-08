
export default abstract class Entity {
	validate() {
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

	toJSON() {
		try {
			return JSON.parse(JSON.stringify(this));
		} catch (error) {
			return null;
		}
	}
}
