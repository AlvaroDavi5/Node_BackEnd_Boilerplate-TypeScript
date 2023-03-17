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
	private deletedBy!: string;

	constructor({ fullName, email, preference }: UserInterface) {
		super();
		this.fullName = fullName;
		this.email = email;
		this.password = '';
		this.preference = preference;
		this.createdAt = new Date();
	}

	public getId(): number { return this.id; }

	public getEmail(): string { return this.email; }
	public setEmail(email: string) { this.email = email; }

	public getPassword(): string { return this.password; }
	public setPassword(passwd: string) { this.password = passwd; }

	public getPhone(): string { return this.phone; }
	public setPhone(phone: string) { this.phone = phone; }

	public getDocument(): string { return this.document; }
	public setDocument(docValue: string) { this.document = docValue; }

	public getDeletedBy(): string { return this.deletedBy; }
	public setDeletedBy(agentId: string) { this.deletedBy = agentId; }
}
