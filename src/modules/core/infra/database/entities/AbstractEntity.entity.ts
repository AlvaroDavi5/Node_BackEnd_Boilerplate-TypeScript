import { Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { returingNumber } from '@shared/types/returnTypeFunc';
import { PaginationInterface } from '@shared/interfaces/listPaginationInterface';


export default abstract class AbstractEntity<I = any> {

	public validate(): { value: any, valid: boolean, error: Error | null } {
		let value: any = null;
		let valid = false;
		let error: Error | null = null;

		if (this instanceof AbstractEntity) {
			valid = true;
			value = { ...this };
		}
		else {
			error = new Error('Invalid Entity');
		}

		return { value, valid, error };
	}

	public exists(value: unknown): boolean {
		return (value !== undefined && value !== null);
	}

	public getDate(dateStr?: string): Date {
		const dateGeneratorHelper: DateGeneratorHelper = new DateGeneratorHelper();
		return dateGeneratorHelper.getDate(true, dateStr);
	}

	public getAttributes(): I {
		return {} as any;
	}
}

export abstract class AbstractEntityList<T> implements PaginationInterface<T> {
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
