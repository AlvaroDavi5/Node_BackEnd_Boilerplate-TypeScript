
export default () => ({
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
