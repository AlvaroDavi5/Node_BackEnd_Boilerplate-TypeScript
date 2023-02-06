module.exports = () => {
	const showLogs = Boolean(process.env.SHOW_LOGS);
	let errorLogger = (value: any) => { };

	if (showLogs) {
		errorLogger = (value: any) => console.error(value?.message || value);
	}
	const logger = {
		error: errorLogger,
		warn: errorLogger,
		info: () => { },
		log: () => { },
	};

	return logger;
};
