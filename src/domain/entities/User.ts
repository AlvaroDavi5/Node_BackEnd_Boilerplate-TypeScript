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
	fu: string,
	preference: UserPreferenceInterface,
	createdAt: Date,
	updatedAt: Date,
	deletedAt: Date,
	deletedBy: string,
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
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;
	private deletedBy!: string | null;

	constructor({ fullName, email, docType, document, fu, phone, preference }: UserInterface) {
		super();
		this.fullName = fullName;
		this.email = email;
		this.docType = docType;
		this.document = document;
		this.fu = fu;
		this.phone = phone;
		this.preference = preference;
		this.password = '';
		this.createdAt = new Date();
		this.updatedAt = null;
		this.deletedAt = null;
		this.deletedBy = null;
	}

	toJSON() {
		const data = {
			id: this.id,
			fullName: this.fullName,
			email: this.email,
			password: this.password,
			phone: this.phone,
			docType: this.docType,
			document: this.document,
			fu: this.fu,
			preference: this.preference,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			deletedAt: this.deletedAt,
			deletedBy: this.deletedBy,
		};

		try {
			return JSON.parse(JSON.stringify(data));
		} catch (error) {
			return null;
		}
	}

	public getId(): number { return this.id; }
	public setId(id: number) { this.id = id; }

	public getLogin(): object {
		return {
			fullName: this.fullName,
			email: this.email,
		};
	}

	public setLogin(email: string, fullName: string) {
		this.fullName = fullName;
		this.email = email;
		this.updatedAt = new Date();
	}

	public getPassword(): string { return this.password; }
	public setPassword(passwd: string) {
		this.password = passwd;
		this.updatedAt = new Date();
	}

	public getPhone(): string { return this.phone; }
	public setPhone(phone: string) {
		this.phone = phone;
		this.updatedAt = new Date();
	}

	public getDocInfos(): object {
		return {
			document: this.document,
			docType: this.docType,
			fu: this.fu,
		};
	}

	public setDocInfos(docValue: string, docType: string, fu: string) {
		this.document = docValue;
		this.docType = docType;
		this.fu = fu;
		this.updatedAt = new Date();
	}

	public getDeletedBy(): string | null { return this.deletedBy; }
	public setDeletedBy(agentId: string) {
		this.deletedBy = agentId;
		this.deletedAt = new Date();
		this.updatedAt = new Date();
	}
}
