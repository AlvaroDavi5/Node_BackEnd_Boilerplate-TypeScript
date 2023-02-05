import { ContainerInterface } from 'src/container';


/**
@param {Object} ctx - Dependency Injection (container)
**/
export default (ctx: ContainerInterface) => ({
	execute: (message = '{}') => {
		let msg = '';

		try {
			msg = JSON.parse(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}
});
