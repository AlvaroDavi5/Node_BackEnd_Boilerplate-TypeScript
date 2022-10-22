import { createLogger, transports, format } from 'winston';
import dotenv from 'dotenv';
dotenv.config();


const defaultMessageFormat = format.printf(msg => {
	const { level, timestamp, message, stack } = msg;
	let log = typeof message === 'object'
		? JSON.stringify(msg.message)
		: message;

	if (stack) {
		log = stack;
	}

	return `${timestamp} / ${level}: ${log}`;
});

const appFormat = format.combine(
	format.errors({ stack: true }),
	format.timestamp(),
	defaultMessageFormat
);

const logsFilePath = process.env.APP_LOGS_PATH || './logs/info.log';

const options = {
	format: format.combine(
		appFormat,
		format.json()
	),
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				appFormat,
			),
		}),
		new transports.File({ filename: logsFilePath })
	]
};

const logger = createLogger(options);


export default logger;
