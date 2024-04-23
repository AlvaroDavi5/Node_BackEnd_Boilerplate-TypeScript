import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate, IsEnum } from 'class-validator';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';
import { ThemesEnum } from '@domain/enums/themes.enum';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { returingNumber, returingString, returingDate } from '@shared/types/returnTypeFunc';


const dateGeneratorHelper = new DateGeneratorHelper();
const dateExample = dateGeneratorHelper.getDate('2024-06-10T03:52:50.885Z', 'iso-8601', true, TimeZonesEnum.SaoPaulo);

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

	@ApiProperty({ type: String, enum: Object.values(ThemesEnum), example: ThemesEnum.DEFAULT, default: null, nullable: true, required: true, description: 'User default theme' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User default theme' })
	@IsEnum(ThemesEnum)
	public defaultTheme: ThemesEnum | null = null;

	@ApiProperty({ type: Date, example: dateExample, default: dateExample, nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: dateGeneratorHelper.getDate(new Date(), 'jsDate', true), nullable: false, description: 'User creation timestamp' })
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
