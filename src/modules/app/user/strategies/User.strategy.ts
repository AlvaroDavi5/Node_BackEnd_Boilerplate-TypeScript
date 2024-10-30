import { Injectable } from '@nestjs/common';
import UserEntity from '@domain/entities/User.entity';
import { getObjKeys } from '@common/utils/dataValidations.util';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';


@Injectable()
export default class UserStrategy {
	public isAllowedToManageUser(userAgent: UserAuthInterface, userData: UserEntity): boolean {
		const isTheSameUsername = userAgent?.username === userData.getEmail();
		const isTheSameId = userAgent?.clientId === userData.getId();

		if (isTheSameUsername && isTheSameId)
			return true;

		return false;
	}

	public mustUpdate<EA = unknown, IA = unknown>(entityAttributes: EA, inputAttributes: IA): boolean {
		if (!entityAttributes || !inputAttributes)
			return false;
		const attributesToUpdate = getObjKeys<IA>(inputAttributes);

		let mustUpdate = false;
		attributesToUpdate.forEach((attributeKey) => {
			const inputField = inputAttributes[String(attributeKey) as keyof IA];
			const entityField = entityAttributes[String(attributeKey) as keyof EA];
			const isUpdatedField = inputField !== undefined;
			let hasValueChanged = false;

			if (isUpdatedField) {
				if (typeof inputField === 'object' && inputField)
					hasValueChanged = this.mustUpdate(entityField, inputField);
				else
					hasValueChanged = inputField !== entityField;
			}

			if (isUpdatedField && hasValueChanged)
				mustUpdate = true;
		});

		return mustUpdate;
	}
}
