import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { IUpdateUserPreference } from '@domain/entities/UserPreference.entity';
import { ThemesEnum } from '@domain/enums/themes.enum';


export class UserPreferenceInputDto implements IUpdateUserPreference {
	@ApiProperty({ type: String, example: './image.png', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public imagePath?: string;

	@ApiProperty({
		type: ThemesEnum,
		enumName: String(ThemesEnum),
		enum: ThemesEnum,
		example: ThemesEnum.DEFAULT,
		default: undefined,
		nullable: false,
		required: false,
	})
	@IsEnum(ThemesEnum)
	@IsOptional()
	public defaultTheme?: ThemesEnum;
}
