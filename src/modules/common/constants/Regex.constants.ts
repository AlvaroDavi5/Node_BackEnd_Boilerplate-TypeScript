import { Injectable } from '@nestjs/common';


interface CustomRegEx {
	name: string,
	message: (attributeName: string) => string,
	regex: RegExp,
}

@Injectable()
export default class RegExConstants {
	private readonly requiredCharsPattern: RegExp = /0-9A-Za-zÀ-ÖØ-öø-ÿ/;
	private readonly requiredAsciiPattern: RegExp = /!-~/;
	private readonly passwordLimitPattern: RegExp = /9,60/;
	public readonly passwordPattern: CustomRegEx;

	constructor() {
		this.passwordPattern = {
			name: 'PasswordPattern',
			message: (field) => `'${field}' must have digits and characters like ${this.requiredCharsPattern.source + this.requiredAsciiPattern.source} and length between ${this.passwordLimitPattern.source} rage.`,
			regex: new RegExp(
				`^(?=.*[${this.requiredCharsPattern.source}])(?=.*[${this.requiredAsciiPattern.source}])[${this.requiredCharsPattern.source}${this.requiredAsciiPattern.source}].{${this.passwordLimitPattern.source}}$`
			),
		};
	}
}
