
export type enumValue = string

export interface EnumInterface {
	[key: string]: enumValue,

	values: () => Array<enumValue>,
	keys: () => Array<enumValue>,
}
