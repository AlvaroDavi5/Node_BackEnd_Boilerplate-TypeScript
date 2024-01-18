import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsBooleanString } from 'class-validator';
import { ListQueryInterface } from 'src/types/listPaginationInterface';


export abstract class ListQueryInputDto implements ListQueryInterface {
	@ApiProperty({ type: Number, example: 5, default: undefined, nullable: true, required: false })
	@IsNumberString()
	@IsOptional()
	public limit?: number;

	@ApiProperty({ type: Number, example: 1, default: undefined, nullable: true, required: false })
	@IsNumberString()
	@IsOptional()
	public page?: number;

	@ApiProperty({ type: String, enum: ['ASC', 'DESC'], example: 'ASC', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public order?: 'ASC' | 'DESC';

	@ApiProperty({ type: String, enum: ['createdAt', 'updatedAt', 'deletedAt'], example: 'createdAt', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public sortBy?: 'createdAt' | 'updatedAt' | 'deletedAt';

	@ApiProperty({ type: String, example: 'My Name', default: undefined, nullable: true, required: false })
	@IsString()
	@IsOptional()
	public searchTerm?: string;

	@ApiProperty({ type: Boolean, example: true, default: undefined, nullable: true, required: false })
	@IsBooleanString()
	@IsOptional()
	public selectSoftDeleted?: boolean;
}
