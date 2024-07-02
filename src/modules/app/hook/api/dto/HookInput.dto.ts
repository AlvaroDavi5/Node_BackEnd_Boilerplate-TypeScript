import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { RegisterEventHookInterface } from '@app/hook/api/schemas/registerEventHook.schema';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';


export class RegisterEventHookInputDto implements RegisterEventHookInterface {
	@ApiProperty({ type: String, example: 'http://localhost:4000/api/hook', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public responseEndpoint!: string;

	@ApiProperty({ type: HttpMethodsEnum, enum: HttpMethodsEnum, example: HttpMethodsEnum.POST, default: HttpMethodsEnum.GET, nullable: false, required: true })
	@IsEnum(HttpMethodsEnum)
	@IsNotEmpty()
	public responseMethod!: HttpMethodsEnum;

	@ApiProperty({ type: String, example: 'INVALID', default: '', nullable: false, required: true })
	@IsString()
	@IsNotEmpty()
	public responseSchema!: string;

	@ApiProperty({ type: Date, example: (new Date('2024-04-17T17:36:48.666Z').toISOString()), default: (new Date('2024-04-17T17:36:48.666Z').toISOString()), nullable: false, required: false })
	@IsDateString()
	@IsNotEmpty()
	public sendAt!: Date;
}
