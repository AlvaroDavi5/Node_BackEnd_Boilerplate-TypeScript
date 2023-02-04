import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
**/
export default (ctx: ContainerInterface) => ({
	execute: (message: any = {}) => {
		let msg = '';

		try {
			msg = JSON.stringify(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}
});
