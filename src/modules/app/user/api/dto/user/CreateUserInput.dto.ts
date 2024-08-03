import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ICreateUser } from '@domain/entities/User.entity';
import RegExConstants from '@common/constants/Regex.constants';
import { UserPreferenceInputDto } from '../userPreference/UserPreferenceInput.dto';


const regExConstants = new RegExConstants();
const { regex: onlyNumericDigitsRegex } = regExConstants.onlyNumericDigitsPattern;

export default class CreateUserInputDto implements ICreateUser {
	@ApiProperty({ type: String, example: 'User Default', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public fullName!: string;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public email!: string;

	@ApiProperty({ type: String, example: 'pass123', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public password!: string;

	@ApiProperty({ type: String, example: '+0000000000000', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public phone?: string;

	@ApiProperty({ type: String, example: 'INVALID', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public docType?: string;

	@ApiProperty({ type: String, example: '00000000000', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	@Transform(({ value }: { value?: string }) => {
		if (!value)
			return value;
		return value.replace(onlyNumericDigitsRegex, '');
	})
	public document?: string;

	@ApiProperty({ type: String, example: 'UF', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public fu?: string;

	@ApiProperty({ type: UserPreferenceInputDto, example: UserPreferenceInputDto, default: undefined, nullable: false, required: false })
	@Type(() => UserPreferenceInputDto)
	@ValidateNested()
	@IsOptional()
	preference?: UserPreferenceInputDto;
}
