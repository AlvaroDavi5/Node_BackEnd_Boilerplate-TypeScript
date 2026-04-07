import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsEnum, IsUUID } from 'class-validator';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { getObjValues, isNullOrUndefined } from '@common/utils/dataValidations.util';
import { fromISOToDateTime, fromDateTimeToJSDate, getDateTimeNow } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import AbstractEntity from '@common/classes/AbstractEntity.entity';
import { returingString, returingDate } from '@shared/internal/types/returnTypeFunc';


const dateTimeExample = fromISOToDateTime('2024-06-10T03:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
const dateExample = fromDateTimeToJSDate(dateTimeExample, false);
const getDateNow = () => fromDateTimeToJSDate(getDateTimeNow(TimeZonesEnum.America_SaoPaulo));

interface UserPreferenceInterface {
	id?: string,
	userId?: string,
	imagePath?: string,
	defaultTheme?: ThemesEnum,
	readonly createdAt: Date,
	updatedAt?: Date,
	deletedAt?: Date,
}

export type ICreateUserPreference = Omit<UserPreferenceInterface, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type IUpdateUserPreference = Partial<ICreateUserPreference>;
export type IViewUserPreference = UserPreferenceInterface;

@ObjectType({
	description: 'user preference entity',
})
export default class UserPreferenceEntity extends AbstractEntity<UserPreferenceInterface> {
	@ApiProperty({
		type: String,
		example: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
		default: '', nullable: false, required: false,
		description: 'Database register ID',
	})
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsString()
	@IsUUID()
	private id!: string;

	@ApiProperty({ type: String, example: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', default: '', nullable: false, required: false, description: 'User ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'User ID' })
	@IsString()
	private userId!: string;

	@ApiProperty({ type: String, example: './image.png', default: null, nullable: true, required: true, description: 'User profile image path' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User profile image path' })
	@IsString()
	private imagePath: string | null = null;

	@ApiProperty({
		type: String, enum: getObjValues<ThemesEnum>(ThemesEnum),
		example: ThemesEnum.DEFAULT,
		default: null, nullable: true, required: true,
		description: 'User default theme',
	})
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User default theme' })
	@IsEnum(ThemesEnum)
	public defaultTheme: ThemesEnum | null = null;

	@ApiProperty({ type: Date, example: dateExample, default: dateExample, nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: getDateNow(), nullable: false, description: 'User creation timestamp' })
	@IsDate()
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: false, description: 'User updated timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User updated timestamp' })
	@IsDate()
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User deleted timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User deleted timestamp' })
	@IsDate()
	public deletedAt: Date | null = null;

	constructor(dataValues: Partial<UserPreferencesModel | IViewUserPreference> = {}) {
		super();

		const userIdFromDataValues = this.getUserIdFromDataValues(dataValues);

		if (!isNullOrUndefined(dataValues?.id)) this.id = dataValues.id;
		if (!isNullOrUndefined(userIdFromDataValues)) this.userId = userIdFromDataValues;
		if (!isNullOrUndefined(dataValues?.imagePath)) this.imagePath = dataValues.imagePath;
		if (!isNullOrUndefined(dataValues?.defaultTheme)) this.setDefaultTheme(dataValues.defaultTheme);
		if (!isNullOrUndefined(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (!isNullOrUndefined(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
		this.createdAt = !isNullOrUndefined(dataValues?.createdAt) ? this.getDate(dataValues.createdAt) : this.getDate();
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

	public getId(): string {
		return this.id;
	}
	public setId(id: string): void {
		if (id.length < 1)
			return;

		this.id = id;
	}

	public getUserId(): string {
		return this.userId;
	}
	public setUserId(userId: string): void {
		if (userId.length < 1)
			return;

		this.userId = userId;
	}

	public getDefaultTheme(): ThemesEnum | null {
		return this.defaultTheme;
	}
	public setDefaultTheme(theme: ThemesEnum | string): void {
		const themeValues = getObjValues<string>(ThemesEnum);

		if (!themeValues.includes(theme))
			throw new Error(`Invalid theme value: ${theme}. Valid values are: ${themeValues.join(', ')}`);

		this.defaultTheme = theme as ThemesEnum;
	}

	public getImagePath(): string | null {
		return this.imagePath;
	}
	public setImagePath(path: string): void {
		this.imagePath = path;
	}

	private getUserIdFromDataValues(dataValues: Partial<UserPreferencesModel | IViewUserPreference>): string | undefined {
		if ('userId' in dataValues && !isNullOrUndefined(dataValues?.userId)) {
			return dataValues.userId;
		}

		if ('user' in dataValues && !isNullOrUndefined(dataValues?.user?.id)) {
			return dataValues.user.id;
		}

		return undefined;
	}
}

export const returingUserPreferenceEntity = () => UserPreferenceEntity;
