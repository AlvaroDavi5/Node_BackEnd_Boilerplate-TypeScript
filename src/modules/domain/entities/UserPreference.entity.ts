import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsEnum } from 'class-validator';
import { ThemesEnum } from '@domain/enums/themes.enum';
import AbstractEntity from '@shared/classes/AbstractEntity.entity';
import { returingString, returingDate } from '@shared/types/returnTypeFunc';


export interface UserPreferenceInterface {
	id?: string,
	userId?: string,
	imagePath?: string,
	defaultTheme?: ThemesEnum,
	readonly createdAt: Date,
	updatedAt?: Date,
	deletedAt?: Date,
}

export type CreateUserPreferenceInterface = Omit<UserPreferenceInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateUserPreferenceInterface = Partial<CreateUserPreferenceInterface>;
export type ViewUserPreferenceInterface = UserPreferenceInterface;

@ObjectType({
	description: 'user preference entity',
})
export default class UserPreferenceEntity extends AbstractEntity<UserPreferenceInterface> {
	@ApiProperty({ type: String, example: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', default: '', nullable: false, required: false, description: 'User ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'User ID' })
	@IsString()
	private userId!: string;

	@ApiProperty({ type: String, example: './image.png', default: null, nullable: true, required: true, description: 'User profile image path' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User profile image path' })
	@IsString()
	private imagePath: string | null = null;

	@ApiProperty({
		type: String, enum: Object.values(ThemesEnum),
		example: ThemesEnum.DEFAULT,
		default: null, nullable: true, required: true,
		description: 'User default theme',
	})
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User default theme' })
	@IsEnum(ThemesEnum)
	public defaultTheme: ThemesEnum | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User deleted timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User deleted timestamp' })
	@IsDate()
	public deletedAt: Date | null = null;

	constructor(dataValues: any) {
		super(dataValues);
		if (this.exists(dataValues?.id)) this.setId(dataValues.id);
		if (this.exists(dataValues?.userId)) this.userId = dataValues.userId;
		else if (this.exists(dataValues?.user?.id)) this.userId = dataValues.user.id;
		if (this.exists(dataValues?.imagePath)) this.imagePath = dataValues.imagePath;
		if (this.exists(dataValues?.defaultTheme)) this.defaultTheme = dataValues.defaultTheme;
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (this.exists(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
	}

	public getAttributes(): UserPreferenceInterface {
		return {
			id: this.getId(),
			userId: this.userId,
			imagePath: this.imagePath ?? undefined,
			defaultTheme: this.defaultTheme ?? undefined,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt ?? undefined,
			deletedAt: this.deletedAt ?? undefined,
		};
	}

	public getUserId(): string { return this.userId; }
	public setUserId(userId: string): void {
		if (userId.length < 1)
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

export const returingUserPreferenceEntity = () => UserPreferenceEntity;
