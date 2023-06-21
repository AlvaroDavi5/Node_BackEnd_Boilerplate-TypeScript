import Entity from '@infra/database/entities/Entity';


export interface UserPreferenceInterface {
	id?: number;
	userId: number;
	imagePath: string;
	defaultTheme: string;
	readonly createdAt: Date;
	updatedAt: Date | null;
	deletedAt: Date | null;
}

export default class UserPreference extends Entity {
	private id: number;
	private userId: number;
	private imagePath: string;
	public defaultTheme: string;
	public readonly createdAt: Date;
	public updatedAt: Date | null;
	public deletedAt: Date | null;

	constructor(dataValues: any) {
		super();
		this.id = (dataValues?.id) ? dataValues.id : null;
		this.userId = (dataValues?.userId) ? dataValues.userId : null;
		this.imagePath = (dataValues?.imagePath) ? dataValues.imagePath : null;
		this.defaultTheme = (dataValues?.defaultTheme) ? dataValues.defaultTheme : null;
		this.createdAt = (dataValues?.createdAt) ? dataValues.createdAt : new Date();
		this.updatedAt = (dataValues?.updatedAt) ? dataValues.updatedAt : null;
		this.deletedAt = (dataValues?.deletedAt) ? dataValues.deletedAt : null;
	}

	public getAttributes() {
		return {
			id: this.id,
			userId: this.userId,
			imagePath: this.imagePath,
			defaultTheme: this.defaultTheme,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			deletedAt: this.deletedAt,
		};
	}

	public getId(): number { return this.id; }
	public setId(id: number): void { this.id = id; }

	public getUserId(): number { return this.userId; }
	public setUserId(userId: number): void { this.userId = userId; }

	public getDefaultTheme(): string { return this.defaultTheme; }
	public setDefaultTheme(theme: string): void {
		this.defaultTheme = theme;
		this.updatedAt = new Date();
	}

	public getImagePath(): string { return this.imagePath; }
	public setImagePath(path: string): void {
		this.imagePath = path;
		this.updatedAt = new Date();
	}
}
