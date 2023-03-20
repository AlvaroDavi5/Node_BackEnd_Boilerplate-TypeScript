
export default () => ({
	execute: (message = '{}') => {
		let msg = '';

		if (typeof message === 'object')
			return message;

		try {
			msg = JSON.parse(message);
		}
		catch (error) {
			msg = String(message);
		}

		return msg;
	}
});
