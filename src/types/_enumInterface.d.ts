
export type enumValue = string | number

export interface EnumInterface {
	[key: string]: enumValue,

	values: () => Array<enumValue>,
	keys: () => Array<enumValue>,
}
