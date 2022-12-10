import { createLogger, transports, format, exitOnError } from 'winston';
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
	format.errors({ stack: false }),
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
	],
	exitOnError: false,
};

export const logger = createLogger(options);

export class LoggerStream {
	write(message: string | any, encoding: string | any) {
		logger.info(message.substring(0, message.lastIndexOf('\n')));
	}
}

export default logger;