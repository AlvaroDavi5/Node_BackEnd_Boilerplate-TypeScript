import cron from 'node-cron';
import { ContainerInterface } from 'src/container';


export default ({
	logger,
}: ContainerInterface) => {
	/*
	? second (0 - 59, optional)
	? minute (0 - 59)
	? hour (0 - 23)
	? day of month (1 - 31)
	? month (1 - 12)
	? day of week (0 - 7)
	*/
	const job = cron.schedule(
		'0 */3 * * * *', // // every 3 minutes
		() => {
			try {
				logger.info('Running Sync cron');
			} catch (error) {
				logger.error(error);
			}
		},
		{ scheduled: false }
	);

	return job;
};
