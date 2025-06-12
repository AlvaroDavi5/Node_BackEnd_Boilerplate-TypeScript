import { Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { fromISOToDateTime, fromDateTimeToJSDate } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import AbstractEntityList from '@common/classes/AbstractListEntity.entity';
import UserEntity from '../User.entity';
import UserPreferenceEntity from '../UserPreference.entity';


export const returingUserEntityArray = () => Array<UserEntity>;

const dateTimeExample = fromISOToDateTime('2024-06-10T03:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
const dateExample = fromDateTimeToJSDate(dateTimeExample, false);

export default class UserListEntity extends AbstractEntityList<UserEntity> {
	@ApiProperty({
		type: UserEntity,
		isArray: true,
		example: ([
			new UserEntity({
				fullName: 'User Default',
				docType: 'INVALID',
				fu: 'UF',
				preference: new UserPreferenceEntity({
					imagePath: './image.png',
					defaultTheme: 'DEFAULT',
				}),
				createdAt: dateExample,
				updatedAt: dateExample,
			}),
		]),
		default: [],
		nullable: false,
		description: 'User list content',
	})
	@Type(returingUserEntityArray)
	@Field(returingUserEntityArray, { defaultValue: [], nullable: false, description: 'User list content' })
	public content: UserEntity[] = [];
}
