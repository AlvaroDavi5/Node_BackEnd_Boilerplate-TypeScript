import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsBooleanString } from 'class-validator';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';


export abstract class ListQueryInputDto implements ListQueryInterface {
	@ApiProperty({ type: Number, example: 5, default: undefined, nullable: true, required: false, description: 'Results amount by page' })
	@IsNumberString()
	@IsOptional()
	public limit?: number;

	@ApiProperty({ type: Number, example: 1, default: undefined, nullable: true, required: false, description: 'Page index' })
	@IsNumberString()
	@IsOptional()
	public page?: number;

	@ApiProperty({ type: String, enum: ['ASC', 'DESC'], example: 'ASC', default: undefined, nullable: true, required: false, description: 'List order' })
	@IsString()
	@IsOptional()
	public order?: 'ASC' | 'DESC';

	@ApiProperty({ type: String, enum: ['createdAt', 'updatedAt', 'deletedAt'], example: 'createdAt', default: undefined, nullable: true, required: false, description: 'Sort by attribute' })
	@IsString()
	@IsOptional()
	public sortBy?: 'createdAt' | 'updatedAt' | 'deletedAt';

	@ApiProperty({ type: String, example: 'My Name', default: undefined, nullable: true, required: false, description: 'Term for search' })
	@IsString()
	@IsOptional()
	public searchTerm?: string;

	@ApiProperty({ type: Boolean, example: true, default: undefined, nullable: true, required: false, description: 'Filter just soft-deleted registers' })
	@IsBooleanString()
	@IsOptional()
	public selectSoftDeleted?: boolean;
}
