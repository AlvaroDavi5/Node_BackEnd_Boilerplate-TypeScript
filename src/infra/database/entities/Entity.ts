
export default abstract class Entity {
	public validate() {
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

	getAttributes() {
		return {};
	}
}
