import { Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsUUID } from 'class-validator';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { returingDate, returingString } from '@shared/types/returnTypeFunc';


const dateGeneratorHelper = new DateGeneratorHelper();
const dateExample = dateGeneratorHelper.getDate('2024-06-10T03:52:50.885Z', 'iso-8601', true, TimeZonesEnum.SaoPaulo);

export default abstract class AbstractEntity<I = any> {
	@ApiProperty({ type: String, example: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', default: '', nullable: false, required: false, description: 'Database register ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsString()
	@IsUUID()
	private id!: string;

	@ApiProperty({ type: Date, example: dateExample, default: dateExample, nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: dateGeneratorHelper.getDate(new Date(), 'jsDate', true), nullable: false, description: 'User creation timestamp' })
	@IsDate()
	public readonly createdAt!: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User updated timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User updated timestamp' })
	@IsDate()
	public updatedAt: Date | null = null;

	public validate(): { value: any, valid: boolean, error: Error | null } {
		let value: any = null;
		let valid = false;
		let error: Error | null = null;

		if (this instanceof AbstractEntity) {
			valid = true;
			value = { ...this };
		} else {
			error = new Error('Invalid Entity');
		}

		return { value, valid, error };
	}

	constructor(dataValues: any) {
		this.createdAt = this.exists(dataValues?.createdAt) ? this.getDate(dataValues.createdAt) : this.getDate();
	}

	public exists(value: unknown): boolean {
		return (value !== undefined && value !== null);
	}

	public getDate(strDate?: string): Date {
		const dateGeneratorHelper: DateGeneratorHelper = new DateGeneratorHelper();
		return dateGeneratorHelper.getDate(strDate ?? new Date().toISOString(), 'iso-8601', true);
	}

	public getId(): string { return this.id; }
	public setId(id: string): void {
		if (id.length < 1)
			return;

		this.id = id;
		this.updatedAt = this.getDate();
	}

	public getAttributes(): I {
		return {
			id: this.id,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt ?? undefined,
		} as I;
	}
}
