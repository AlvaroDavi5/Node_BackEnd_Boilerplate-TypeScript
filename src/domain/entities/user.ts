import Entity from './entity';
import { UserPreferenceInterface } from './userPreference';


export interface UserInterface {
	id: number,
	fullName: string,
	email: string,
	password: string,
	phone: string,
	docType: string,
	document: string,
	uf: string,
	preference: UserPreferenceInterface,
	createdAt: Date,
	updatedAt: Date,
}

export default class User extends Entity {
	public id!: number;
	public fullName!: string;
	public email!: string;
	public password!: string;
	public phone!: string;
	public docType!: string;
	public document!: string;
	public fu!: string;
	public preference: UserPreferenceInterface;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	constructor({ fullName, email, preference }: UserInterface) {
		super();
		this.fullName = fullName;
		this.email = email;
		this.password = '';
		this.preference = preference;
	}

	validate() {
		let value: any = null;
		let valid = false;
		let errors: Error | null = null;

		if (this instanceof User) {
			valid = true;
			value = { ...this };
		}
		else {
			errors = new Error('Invalid Entity');
		}

		return { value, valid, errors };
	}
}
