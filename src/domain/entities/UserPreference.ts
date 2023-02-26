import Entity from './Entity';


export interface UserPreferenceInterface {
	id: number,
	userId: number,
	imagePath: string,
	defaultTheme: number,
	createdAt: Date,
	updatedAt: Date,
}

export default class UserPreference extends Entity {
	private id!: number;
	private userId!: number;
	private imagePath!: string;
	public defaultTheme!: number;
	public readonly createdAt!: Date;
	public updatedAt!: Date;
	public deletedAt!: Date;

	constructor({ userId, defaultTheme }: UserPreferenceInterface) {
		super();
		this.userId = userId;
		this.defaultTheme = defaultTheme;
	}
}
