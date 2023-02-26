import Entity from './Entity';
import { UserPreferenceInterface } from './UserPreference';


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
	private id!: number;
	public fullName!: string;
	private email!: string;
	private password!: string;
	private phone!: string;
	public docType!: string;
	private document!: string;
	public fu!: string;
	public preference: UserPreferenceInterface;
	public readonly createdAt!: Date;
	public updatedAt!: Date;
	public deletedAt!: Date;

	constructor({ fullName, email, preference }: UserInterface) {
		super();
		this.fullName = fullName;
		this.email = email;
		this.password = '';
		this.preference = preference;
		this.createdAt = new Date();
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
