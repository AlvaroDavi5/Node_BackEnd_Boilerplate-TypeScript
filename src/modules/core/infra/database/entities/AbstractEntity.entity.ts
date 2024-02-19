import { Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { returingNumber } from 'src/types/returnTypeFunc';


export default abstract class AbstractEntity {
	private readonly dateGeneratorHelper: DateGeneratorHelper = new DateGeneratorHelper();

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
		return this.dateGeneratorHelper.getDate(true, dateStr);
	}

	public getAttributes(): any {
		return {};
	}
}

export abstract class AbstractEntityList<T> {
	public content: T[] = [];

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Page number' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Page number' })
	@IsNumber()
	public pageNumber = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Amount of items by page' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Amount of items by page' })
	@IsNumber()
	public pageSize = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Amount of pages' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Amount of pages' })
	@IsNumber()
	public totalPages = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, description: 'Amount of items' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Amount of items' })
	@IsNumber()
	public totalItems = 0;
}
