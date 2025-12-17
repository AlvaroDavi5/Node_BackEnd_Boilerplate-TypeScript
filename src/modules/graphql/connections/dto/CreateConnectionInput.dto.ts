import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { returingString, returingBoolean } from '@shared/internal/types/returnTypeFunc';


@InputType()
export default class CreateConnectionInputDto {
	@Field(returingString, { defaultValue: '', nullable: false, description: 'WebSocket ID' })
	@IsNotEmpty()
	@IsString()
	public subscriptionId!: string;

	@Field(returingString, { defaultValue: null, nullable: true, description: 'Client machine ID' })
	@IsOptional()
	@IsString()
	public clientId?: string | null;

	@Field(returingBoolean, { defaultValue: false, nullable: false, description: 'Listen new connections flag' })
	@IsOptional()
	@IsBoolean()
	public newConnectionsListen?: boolean;
}
