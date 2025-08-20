import { Injectable } from '@nestjs/common';


interface CustomRegEx {
	name: string,
	message: (attributeName: string) => string,
	regex: RegExp,
}

@Injectable()
export default class RegExConstants {
	public readonly passwordPattern: CustomRegEx;
	public readonly onlyNumericDigitsPattern: CustomRegEx;

	constructor() {
		this.passwordPattern = {
			name: 'PasswordPattern',
			message: (field) => `'${field}' must have digits and characters like: '0-9 A-z À-ÿ ! @ ~' and length between 9-60 rage.`,
			regex: this.buildPasswordRegEx(),
		};

		this.onlyNumericDigitsPattern = {
			name: 'OnlyNumericDigitsPattern',
			message: (field) => `'${field}' must have only numeric digits`,
			regex: /\D/g,
		};
	}

	private getRegExSource(regex: RegExp): string {
		return regex.source;
	}

	private parseRegEx(regexSrc: string): RegExp {
		// eslint-disable-next-line security/detect-non-literal-regexp
		return new RegExp(regexSrc);
	}

	private buildPasswordRegEx(): RegExp {
		const requiredCharsPattern = this.getRegExSource(/0-9A-Za-zÀ-ÖØ-öø-ÿ/);
		const requiredAsciiPattern = this.getRegExSource(/!-~/);
		const passwordLimitPattern = this.getRegExSource(/9,60/);

		// eslint-disable-next-line max-len
		return this.parseRegEx(`^(?=.*[${requiredCharsPattern}])(?=.*[${requiredAsciiPattern}])[${requiredCharsPattern}${requiredAsciiPattern}].{${passwordLimitPattern}}$`);
	}
}
