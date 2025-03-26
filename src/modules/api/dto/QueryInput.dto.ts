import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsBooleanString, IsEnum } from 'class-validator';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';


export class ListQueryInputDto implements ListQueryInterface {
	@ApiProperty({ type: Number, example: 5, default: undefined, nullable: false, required: false, description: 'Results amount by page' })
	@IsOptional()
	@IsNumberString()
	public limit?: number;

	@ApiProperty({ type: Number, example: 1, default: undefined, nullable: false, required: false, description: 'Page index' })
	@IsOptional()
	@IsNumberString()
	public page?: number;

	@ApiProperty({ type: String, enum: ['ASC', 'DESC'], example: 'ASC', default: undefined, nullable: false, required: false, description: 'List order' })
	@IsOptional()
	@IsEnum(['ASC', 'DESC'])
	public order?: 'ASC' | 'DESC';

	@ApiProperty({
		type: String, enum: ['createdAt', 'updatedAt', 'deletedAt'], example: 'createdAt',
		default: undefined, nullable: false, required: false,
		description: 'Sort by attribute'
	})
	@IsOptional()
	@IsEnum(['createdAt', 'updatedAt', 'deletedAt'])
	public sortBy?: 'createdAt' | 'updatedAt' | 'deletedAt';

	@ApiProperty({ type: String, example: 'My Name', default: undefined, nullable: false, required: false, description: 'Term for search' })
	@IsOptional()
	@IsString()
	public searchTerm?: string;

	@ApiProperty({ type: Boolean, example: true, default: undefined, nullable: false, required: false, description: 'Filter just soft-deleted registers' })
	@IsOptional()
	@IsBooleanString()
	public selectSoftDeleted?: boolean;
}
