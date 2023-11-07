import { ApiProperty } from '@nestjs/swagger';


export default abstract class AbstractEntity {
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

	public getAttributes(): any {
		return {};
	}
}

export abstract class AbstractEntityList<T> {
	public content: T[] = [];

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false })
	public pageNumber = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false })
	public pageSize = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false })
	public totalPages = 0;

	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false })
	public totalItems = 0;
}
