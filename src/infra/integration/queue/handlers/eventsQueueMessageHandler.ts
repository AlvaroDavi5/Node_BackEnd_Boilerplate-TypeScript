import { ContainerInterface } from 'src/container';
interface queueMessageInterface {
	Body: string
}


/**
@param {Object} ctx - Dependency Injection.
@param {import('src/interface/queue/schemas/eventSchema')} ctx.eventSchema
@param {import('src/infra/error/exceptions')} ctx.exceptions
@param {import('src/infra/logging/logger')} ctx.logger
**/
module.exports = ({
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
				throw exceptions.contract(error);

			logger.info(value);
		} catch (error) {
			logger.error(error);
		}
	}
};
