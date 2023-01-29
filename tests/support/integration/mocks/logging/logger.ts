module.exports = () => {
	const showLogs = process.env.SHOW_LOGS;
	let errorLogger = (value: any) => { };

	if (showLogs) {
		errorLogger = (value: any) => console.log(value?.message || value);
	}
	const logger = {
		error: errorLogger,
		warn: errorLogger,
		info: () => { },
		log: () => { },
	};

	return logger;
};
