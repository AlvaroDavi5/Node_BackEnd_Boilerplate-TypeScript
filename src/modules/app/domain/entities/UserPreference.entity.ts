import { ApiProperty } from '@nestjs/swagger';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';


export interface UserPreferenceInterface {
	id: number | undefined,
	userId: number | undefined,
	imagePath: string | undefined,
	defaultTheme: string | undefined,
	readonly createdAt: Date | undefined,
	updatedAt: Date | undefined,
	deletedAt: Date | undefined,
}

export default class UserPreferenceEntity extends AbstractEntity {
	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false })
	private id = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false })
	private userId = 0;

	@ApiProperty({ type: String, example: './image.png', default: null, nullable: true })
	private imagePath: string | null = null;

	@ApiProperty({ type: String, example: 'DEFAULT', default: null, nullable: true })
	public defaultTheme: string | null = null;

	@ApiProperty({ type: Date, example: (new Date()), default: (new Date()), nullable: false })
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true })
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true })
	public deletedAt: Date | null = null;

	constructor(dataValues: any) {
		super();
		if (this.exists(dataValues?.id)) this.id = dataValues.id;
		if (this.exists(dataValues?.userId)) this.userId = dataValues.userId;
		if (this.exists(dataValues?.imagePath)) this.imagePath = dataValues.imagePath;
		if (this.exists(dataValues?.defaultTheme)) this.defaultTheme = dataValues.defaultTheme;
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (this.exists(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
		this.createdAt = this.exists(dataValues?.createdAt) ? dataValues.createdAt : new Date();
	}

	public getAttributes(): UserPreferenceInterface {
		return {
			id: this.id || undefined,
			userId: this.userId || undefined,
			imagePath: this.imagePath || undefined,
			defaultTheme: this.defaultTheme || undefined,
			createdAt: this.createdAt || undefined,
			updatedAt: this.updatedAt || undefined,
			deletedAt: this.deletedAt || undefined,
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
