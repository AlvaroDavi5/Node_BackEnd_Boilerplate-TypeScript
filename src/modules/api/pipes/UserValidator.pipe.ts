import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, IsString } from 'class-validator';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import Exceptions from '@core/infra/errors/Exceptions';
import configs from '@core/configs/configs.config';
import createUserSchema, { CreateUserSchemaInterface } from '@api/schemas/user/createUser.schema';
import updateUserSchema, { UpdateUserSchemaInterface } from '@api/schemas/user/updateUser.schema';
import { ThemesEnum } from '@app/domain/enums/themes.enum';


export abstract class CreateUserPipeDto implements CreateUserSchemaInterface {
	@ApiProperty({ type: String, example: 'User Default', default: '', nullable: false, required: true })
	@IsString()
	public fullName = '';

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: '', nullable: false, required: true })
	@IsString()
	public email = '';

	@ApiProperty({ type: String, example: 'pass123', default: '', nullable: false, required: true })
	@IsString()
	public password = '';

	@ApiProperty({ type: String, example: '+0000000000000', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public phone: string | undefined = undefined;

	@ApiProperty({ type: String, example: 'INVALID', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public docType: string | undefined = undefined;

	@ApiProperty({ type: String, example: '00000000000', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public document: string | undefined = undefined;

	@ApiProperty({ type: String, example: 'UF', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public fu: string | undefined = undefined;

	@ApiProperty({ type: String, example: './image.png', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public imagePath: string | undefined = undefined;

	@ApiProperty({ type: String, example: ThemesEnum.DEFAULT, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public defaultTheme: string | undefined = undefined;
}

export abstract class UpdateUserPipeDto implements UpdateUserSchemaInterface {
	@ApiProperty({ type: String, example: 'User Default', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public fullName: string | undefined = undefined;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public email: string | undefined = undefined;

	@ApiProperty({ type: String, example: 'pass123', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public password: string | undefined = undefined;

	@ApiProperty({ type: String, example: '+0000000000000', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public phone: string | undefined = undefined;

	@ApiProperty({ type: String, example: 'INVALID', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public docType: string | undefined = undefined;

	@ApiProperty({ type: String, example: '00000000000', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public document: string | undefined = undefined;

	@ApiProperty({ type: String, example: 'UF', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public fu: string | undefined = undefined;

	@ApiProperty({ type: String, example: './image.png', default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public imagePath: string | undefined = undefined;

	@ApiProperty({ type: String, example: ThemesEnum.DEFAULT, default: undefined, nullable: true, required: false })
	@ValidateIf((object, value) => (value !== undefined))
	@IsString()
	public defaultTheme: string | undefined = undefined;
}

export class CreateUserPipeValidator implements PipeTransform<CreateUserPipeDto, CreateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<CreateUserSchemaInterface>;

	constructor() {
		const appConfigs: any = configs();
		const configServiceMock: any = {
			get: (propertyPath?: string) => {
				if (propertyPath)
					return appConfigs[propertyPath];
				else
					return appConfigs;
			},
		};

		this.schemaValidator = new SchemaValidator<CreateUserSchemaInterface>(new Exceptions(configServiceMock));
	}

	public transform(value: CreateUserPipeDto, metadata: ArgumentMetadata): CreateUserSchemaInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, createUserSchema);
	}
}

export class UpdateUserPipeValidator implements PipeTransform<UpdateUserPipeDto, UpdateUserSchemaInterface> {
	private readonly schemaValidator: SchemaValidator<UpdateUserSchemaInterface>;

	constructor() {
		const appConfigs: any = configs();
		const configServiceMock: any = {
			get: (propertyPath?: string) => {
				if (propertyPath)
					return appConfigs[propertyPath];
				else
					return appConfigs;
			},
		};

		this.schemaValidator = new SchemaValidator<UpdateUserSchemaInterface>(new Exceptions(configServiceMock));
	}

	public transform(value: UpdateUserPipeDto, metadata: ArgumentMetadata): UpdateUserSchemaInterface {
		console.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);
		return this.schemaValidator.validate(value, updateUserSchema);
	}
}
