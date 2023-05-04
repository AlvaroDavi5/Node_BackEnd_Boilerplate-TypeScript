import Entity from './Entity';


export interface UserPreferenceInterface {
	id: number,
	userId: number,
	imagePath: string,
	defaultTheme: string,
	createdAt: Date,
	updatedAt: Date,
}

export default class UserPreference extends Entity {
	public id!: number;
	public userId!: number;
	public imagePath!: string;
	public defaultTheme: string;
	public createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;

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

	getAttributes() {
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
	public setId(id: number) { this.id = id; }

	public getUserId(): number { return this.userId; }
	public setUserId(userId: number) { this.userId = userId; }

	public getDefaultTheme(): string { return this.defaultTheme; }
	public setDefaultTheme(theme: string) {
		this.defaultTheme = theme;
		this.updatedAt = new Date();
	}

	public getImagePath(): string { return this.imagePath; }
	public setImagePath(path: string) {
		this.imagePath = path;
		this.updatedAt = new Date();
	}
}
