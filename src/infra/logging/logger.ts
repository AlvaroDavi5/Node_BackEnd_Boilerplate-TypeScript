import { createLogger, transports, format } from 'winston';
import configs from 'configs/configs';


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

const logsFilePath = configs.application.logsPath || './logs/info.log';

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
