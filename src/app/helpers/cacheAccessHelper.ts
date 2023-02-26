
export default () => ({
	generateKey: (id: string, keyPattern = '') => {
		return `${keyPattern}:${id}`;
	},
	getId: (key: string, keyPattern = '') => {
		return key?.replace(
			`${keyPattern}:`,
			'');
	},
});
