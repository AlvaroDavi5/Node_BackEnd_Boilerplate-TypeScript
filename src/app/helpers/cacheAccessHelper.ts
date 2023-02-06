import { ContainerInterface } from 'src/container';


export default (ctx: ContainerInterface) => ({
	generateKey: (keyPattern = '', id = '') => {
		return `${keyPattern}:${id}`;
	},
	getId: (keyPattern = '', key = '') => {
		return key?.replace(
			`${keyPattern}:`,
			'');
	},
});
