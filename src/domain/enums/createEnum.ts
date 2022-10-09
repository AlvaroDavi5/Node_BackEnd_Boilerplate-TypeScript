
export default (enumData: object) => ({
	...enumData,
	values: () => Object.values(enumData),
	keys: () => Object.keys(enumData),
});
