import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RegisterHookEventInterface } from '@api/schemas/registerHookEvent.schema';


export abstract class RegisterHookEventInputDto implements RegisterHookEventInterface {
	@ApiProperty({ type: String, example: 'http://localhost:4000/api/hook', default: '', nullable: false, required: true })
	@IsString()
	public responseEndpoint!: string;

	@ApiProperty({ type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], example: 'POST', default: '', nullable: false, required: true })
	@IsString()
	public responseMethod!: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

	@ApiProperty({ type: String, example: 'INVALID', default: '', nullable: false, required: true })
	@IsString()
	public responseSchema!: string;
}
