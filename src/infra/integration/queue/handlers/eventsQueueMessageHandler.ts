import { ContainerInterface } from 'src/types/_containerInterface';


interface queueMessageInterface {
	Body: string
}

export default ({
	eventSchema,
	exceptions,
	logger,
}: ContainerInterface) => async (messages: Array<queueMessageInterface>) => {
	for (const message of messages) {
		try {
			logger.info('New message received from Events Queue');

			const data = JSON.parse(message.Body);
			const { value, error } = eventSchema.validate(
				data,
				{ stripUnknown: false }
			);

			if (error)
				throw exceptions.contract({
					name: error.name,
					message: error.message,
					stack: error.stack,
				});

			logger.info(value);
		} catch (error) {
			logger.error(error);
		}
	}
};
