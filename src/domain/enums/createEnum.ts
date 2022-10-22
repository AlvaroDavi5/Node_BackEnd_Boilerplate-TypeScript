import { EnumInterface } from 'src/types/_enumInterface';


export default (enumData: object): EnumInterface => ({
	...enumData,
	values: () => Object.values(enumData),
	keys: () => Object.keys(enumData),
});
