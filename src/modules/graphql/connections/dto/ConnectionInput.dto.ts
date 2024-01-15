import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { returingString, returingBoolean } from 'src/types/returnTypeFunc';


@InputType()
export abstract class CreateConnectionInputDto {
	@Field(returingString, { defaultValue: '', nullable: false, description: 'WebSocket ID' })
	@IsString()
	public subscriptionId!: string;

	@Field(returingString, { defaultValue: null, nullable: true, description: 'CLient machine ID' })
	@IsString()
	@IsOptional()
	public clientId?: string | null;

	@Field(returingBoolean, { defaultValue: false, nullable: false, description: 'Listen new connections flag' })
	@IsBoolean()
	@IsOptional()
	public newConnectionsListen?: boolean;
}

@InputType()
export abstract class UpdateConnectionInputDto extends CreateConnectionInputDto {
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsString()
	public id!: string;
}
