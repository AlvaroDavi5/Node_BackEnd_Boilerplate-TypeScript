import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
**/
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
