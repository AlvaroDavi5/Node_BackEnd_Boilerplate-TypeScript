
export default () => ({
	execute: (message: any = '') => {
		let msg = '';

		try {
			msg = JSON.stringify(message);
		}
		catch (error) { }

		return msg;
	}
});
