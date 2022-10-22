import { UserInterface, UserPreferenceInterface } from 'src/types/_entitiesInterfaces';


export default class User {
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
		this.fullName = fullName;
		this.email = email;
		this.password = '';
		this.preference = preference;
	}
}
