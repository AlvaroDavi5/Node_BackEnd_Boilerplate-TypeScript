import { ApiProperty } from '@nestjs/swagger';
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
	@ApiProperty({ type: Number, example: 0 })
	private id = 0;

	@ApiProperty({ type: Number, example: 0 })
	private userId = 0;

	@ApiProperty({ type: String, example: './image.png' })
	private imagePath: string | null = null;

	@ApiProperty({ type: String, example: 'DEFAULT' })
	public defaultTheme: string | null = null;

	@ApiProperty({ type: Date, example: (new Date()) })
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null })
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null })
	public deletedAt: Date | null = null;

	constructor(dataValues: any) {
		super();
		if (this.exists(dataValues?.id)) this.id = dataValues.id;
		if (this.exists(dataValues?.userId)) this.userId = dataValues.userId;
		if (this.exists(dataValues?.imagePath)) this.imagePath = dataValues.imagePath;
		if (this.exists(dataValues?.defaultTheme)) this.defaultTheme = dataValues.defaultTheme;
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (this.exists(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
		this.createdAt = new Date();
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

	public getDefaultTheme(): string | null { return this.defaultTheme; }
	public setDefaultTheme(theme: string): void {
		this.defaultTheme = theme;
		this.updatedAt = new Date();
	}

	public getImagePath(): string | null { return this.imagePath; }
	public setImagePath(path: string): void {
		this.imagePath = path;
		this.updatedAt = new Date();
	}
}
