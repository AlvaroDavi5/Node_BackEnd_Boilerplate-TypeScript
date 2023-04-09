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
	private id!: number;
	private userId!: number;
	private imagePath!: string;
	public defaultTheme: string;
	public readonly createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;

	constructor({ userId, imagePath, defaultTheme }: UserPreferenceInterface) {
		super();
		this.userId = userId;
		this.imagePath = imagePath || './';
		this.defaultTheme = defaultTheme || '0';
		this.createdAt = new Date();
		this.updatedAt = null;
		this.deletedAt = null;
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
