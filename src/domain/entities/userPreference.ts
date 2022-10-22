import { UserPreferenceInterface } from 'src/types/_entitiesInterfaces';


export default class UserPreference {
	public id!: number;
	public userId!: number;
	public imagePath!: string;
	public defaultTheme!: number;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	constructor({ userId, defaultTheme }: UserPreferenceInterface) {
		this.userId = userId;
		this.defaultTheme = defaultTheme;
	}
}
