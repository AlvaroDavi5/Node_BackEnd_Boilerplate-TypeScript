import Entity from './Entity';
import UserPreference from './UserPreference';


export interface UserInterface {
	id: number,
	fullName: string,
	email: string,
	password: string,
	phone: string,
	docType: string,
	document: string,
	fu: string,
	preference: UserPreference,
	createdAt: Date,
	updatedAt: Date,
	deletedAt: Date,
	deletedBy: string,
}

export default class User extends Entity {
	public id!: number;
	public fullName!: string;
	public email!: string;
	private password!: string;
	public phone!: string;
	public docType!: string;
	public document!: string;
	public fu!: string;
	public preference: UserPreference;
	public createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;
	public deletedBy!: string | null;

	constructor(dataValues: any) {
		super();
		this.id = (dataValues?.id) ? dataValues.id : null;
		this.fullName = (dataValues?.fullName) ? dataValues.fullName : null;
		this.email = (dataValues?.email) ? dataValues.email : null;
		this.password = (dataValues?.password) ? dataValues.password : null;
		this.phone = (dataValues?.phone) ? dataValues.phone : null;
		this.docType = (dataValues?.docType) ? dataValues.docType : null;
		this.document = (dataValues?.document) ? dataValues.document : null;
		this.fu = (dataValues?.fu) ? dataValues.fu : null;
		this.preference = (dataValues?.preference) ? dataValues.preference : null;
		this.createdAt = (dataValues?.createdAt) ? dataValues.createdAt : new Date();
		this.updatedAt = (dataValues?.updatedAt) ? dataValues.updatedAt : null;
		this.deletedAt = (dataValues?.deletedAt) ? dataValues.deletedAt : null;
		this.deletedBy = (dataValues?.deletedBy) ? dataValues.deletedBy : null;
	}

	getAttributes() {
		return {
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

	public setPreference(preference: UserPreference) {
		this.preference = preference;
	}
}
