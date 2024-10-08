import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { LoginUserSchemaInterface } from '@app/user/api/schemas/user/loginUser.schema';


export default class LoginUserInputDto implements LoginUserSchemaInterface {
	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public email!: string;

	@ApiProperty({ type: String, example: 'pass123', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public password!: string;
}
