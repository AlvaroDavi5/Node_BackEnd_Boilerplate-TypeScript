import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { returingString } from '@shared/internal/types/returnTypeFunc';
import CreateConnectionInputDto from './CreateConnectionInput.dto';


@InputType()
export default class UpdateConnectionInputDto extends CreateConnectionInputDto {
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsNotEmpty()
	@IsString()
	public id!: string;
}
