import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { RegisterHookEventInterface } from '@api/schemas/registerHookEvent.schema';


export abstract class RegisterHookEventInputDto implements RegisterHookEventInterface {
	@ApiProperty({ type: String, example: 'http://localhost:4000/api/hook', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public responseEndpoint?: string;

	@ApiProperty({ type: String, example: 'POST', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public responseMethod?: string;

	@ApiProperty({ type: String, example: 'INVALID', default: undefined, nullable: false, required: false })
	@IsString()
	@IsOptional()
	public responseSchema?: string;
}
