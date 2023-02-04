import Entity from './entity';


export interface UserPreferenceInterface {
	id: number,
	userId: number,
	imagePath: string,
	defaultTheme: number,
	createdAt: Date,
	updatedAt: Date,
}

export default class UserPreference extends Entity {
	public id!: number;
	public userId!: number;
	public imagePath!: string;
	public defaultTheme!: number;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	constructor({ userId, defaultTheme }: UserPreferenceInterface) {
		super();
		this.userId = userId;
		this.defaultTheme = defaultTheme;
	}
}
