import { Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { returingNumber } from '@shared/internal/types/returnTypeFunc';
import { PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import AbstractEntity from './AbstractEntity.entity';


export default abstract class AbstractListEntity<T extends AbstractEntity> implements PaginationInterface<T> {
	public content: T[] = [];

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Page index' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Page index' })
	@IsNumber()
	public pageNumber = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Amount of items by page' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Amount of items by page' })
	@IsNumber()
	public pageSize = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Pages amount' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Pages amount' })
	@IsNumber()
	public totalPages = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'All results amount' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'All results amount' })
	@IsNumber()
	public totalItems = 0;
}
