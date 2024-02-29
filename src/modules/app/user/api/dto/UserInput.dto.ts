import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserSchemaInterface } from '@app/user/api/schemas/user/createUser.schema';
import { UpdateUserSchemaInterface } from '@app/user/api/schemas/user/updateUser.schema';
import { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';
import { ThemesEnum } from '@domain/enums/themes.enum';


export abstract class CreateUserInputDto implements CreateUserSchemaInterface {
	@ApiProperty({ type: String, example: 'User Default', default: '', nullable: false, required: true })
	@IsString()
	public fullName!: string;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: '', nullable: false, required: true })
	@IsString()
	public email!: string;

	@ApiProperty({ type: String, example: 'pass123', default: '', nullable: false, required: true })
	@IsString()
	public password!: string;

	@ApiProperty({ type: String, example: '+0000000000000', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public phone?: string;

	@ApiProperty({ type: String, example: 'INVALID', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public docType?: string;

	@ApiProperty({ type: String, example: '00000000000', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public document?: string;

	@ApiProperty({ type: String, example: 'UF', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public fu?: string;

	@ApiProperty({ type: String, example: './image.png', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public imagePath?: string;

	@ApiProperty({ type: String, example: ThemesEnum.DEFAULT, default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public defaultTheme?: string;
}

export abstract class UpdateUserInputDto implements UpdateUserSchemaInterface {
	@ApiProperty({ type: String, example: 'User Default', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public fullName?: string;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public email?: string;

	@ApiProperty({ type: String, example: 'pass123', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public password?: string;

	@ApiProperty({ type: String, example: '+0000000000000', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public phone?: string;

	@ApiProperty({ type: String, example: 'INVALID', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public docType?: string;

	@ApiProperty({ type: String, example: '00000000000', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public document?: string;

	@ApiProperty({ type: String, example: 'UF', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public fu?: string;

	@ApiProperty({ type: String, example: './image.png', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public imagePath?: string;

	@ApiProperty({ type: String, example: ThemesEnum.DEFAULT, default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public defaultTheme?: string;
}

export abstract class LoginUserInputDto implements LoginUserSchemaInterface {
	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: '', nullable: false, required: true })
	@IsString()
	public email!: string;

	@ApiProperty({ type: String, example: 'pass123', default: '', nullable: false, required: true })
	@IsString()
	public password!: string;
}
