import { createLogger, transports, format } from 'winston';
import configs from 'configs/configs';


const logsFilePath = configs.application.logsPath || './logs/logs.log';
const serviceName = configs.application.name || 'Node Boilerplate';

const defaultMessageFormatter = format.printf(msg => {
	const { level, timestamp, message, stack } = msg;
	let log = typeof message === 'object'
		? JSON.stringify(msg.message)
		: message;

	if (stack) {
		log = stack;
	}

	return `${timestamp} | ${level}: ${log}`;
});
const defaultFormat = format.combine(
	format.timestamp(),
	format.errors({ stack: false }),
	defaultMessageFormatter,
);

const options = {
	format: format.combine(
		defaultFormat,
		format.json(),
	),
	defaultMeta: {
		service: serviceName,
		env: process.env.NODE_ENV,
	},
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				defaultFormat,
			),
		}),
		new transports.File({ filename: logsFilePath }),
	],
	exitOnError: false,
};


const logger = createLogger(options);
export class LoggerStream {
	write(message: string): void {
		logger.info(message.substring(0, message.lastIndexOf('\n')));
	}
}

export default logger;
