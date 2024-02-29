import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate } from 'class-validator';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';
import { ThemesEnum } from '../enums/themes.enum';
import { returingNumber, returingString, returingDate } from '@shared/types/returnTypeFunc';


export interface UserPreferenceInterface {
	id?: number,
	userId?: number,
	imagePath?: string,
	defaultTheme?: ThemesEnum,
	readonly createdAt: Date,
	updatedAt?: Date,
	deletedAt?: Date,
}

@ObjectType()
export default class UserPreferenceEntity extends AbstractEntity<UserPreferenceInterface> {
	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, required: false, description: 'Database register ID' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Database register ID' })
	@IsNumber()
	private id = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, required: true, description: 'User ID' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'User ID' })
	@IsNumber()
	private userId = 0;

	@ApiProperty({ type: String, example: './image.png', default: null, nullable: true, required: true, description: 'User profile image path' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User profile image path' })
	@IsString()
	private imagePath: string | null = null;

	@ApiProperty({ type: String, example: ThemesEnum.DEFAULT, default: null, nullable: true, required: true, description: 'User default theme' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User default theme' })
	@IsString()
	public defaultTheme: ThemesEnum | null = null;

	@ApiProperty({ type: Date, example: (new Date('2024-02-28T09:35:31.820')), default: (new Date('2024-02-28T09:35:31.820')), nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: (new Date('2024-02-28T09:35:31.820')), nullable: false, description: 'User creation timestamp' })
	@IsDate()
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User updated timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User updated timestamp' })
	@IsDate()
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User deleted timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User deleted timestamp' })
	@IsDate()
	public deletedAt: Date | null = null;

	constructor(dataValues: any) {
		super();
		if (this.exists(dataValues?.id)) this.id = dataValues.id;
		if (this.exists(dataValues?.userId)) this.userId = dataValues.userId;
		if (this.exists(dataValues?.imagePath)) this.imagePath = dataValues.imagePath;
		if (this.exists(dataValues?.defaultTheme)) this.defaultTheme = dataValues.defaultTheme;
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (this.exists(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
		this.createdAt = this.exists(dataValues?.createdAt) ? this.getDate(dataValues.createdAt) : this.getDate();
	}

	public getAttributes(): UserPreferenceInterface {
		return {
			id: this.id,
			userId: this.userId,
			imagePath: this.imagePath ?? undefined,
			defaultTheme: this.defaultTheme ?? undefined,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt ?? undefined,
			deletedAt: this.deletedAt ?? undefined,
		};
	}

	public getId(): number { return this.id; }
	public setId(id: number): void {
		if (id <= 0)
			return;

		this.id = id;
		this.updatedAt = this.getDate();
	}

	public getUserId(): number { return this.userId; }
	public setUserId(userId: number): void {
		if (userId <= 0)
			return;

		this.userId = userId;
		this.updatedAt = this.getDate();
	}

	public getDefaultTheme(): ThemesEnum | null { return this.defaultTheme; }
	public setDefaultTheme(theme: string): void {
		if (!Object.values(ThemesEnum).includes(theme as any))
			return;

		this.defaultTheme = theme as ThemesEnum;
		this.updatedAt = this.getDate();
	}

	public getImagePath(): string | null { return this.imagePath; }
	public setImagePath(path: string): void {
		this.imagePath = path;
		this.updatedAt = this.getDate();
	}
}
