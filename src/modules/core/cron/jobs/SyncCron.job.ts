import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import LoggerService from '@core/logging/Logger.service';
import SyncCronTask from '@core/cron/tasks/SyncCron.task';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { CronJobsEnum } from '../cronJobs.enum';


@Injectable()
export default class SyncCronJob {
	public readonly name: string;
	public readonly cronName: string;
	public readonly cronExpression: CronExpression;

	constructor(
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly syncCronTask: SyncCronTask,
		private readonly logger: LoggerService,
	) {
		this.name = SyncCronJob.name;
		this.cronName = CronJobsEnum.SYNC_CRON;
		this.cronExpression = CronExpression.EVERY_5_MINUTES;
		this.logger.debug(`Created ${this.name}`);
	}

	/*
	? second (0 - 59, optional)
	? minute (0 - 59)
	? hour (0 - 23)
	? day of month (1 - 31)
	? month (1 - 12)
	? day of week (0 - 7)
	*/
	@Cron('0 */5 * * * *', {
		// // first second every 5 minutes
		name: CronJobsEnum.SYNC_CRON,
		timeZone: TimeZonesEnum.America_SaoPaulo,
		disabled: false,
		unrefTimeout: false,
	})
	public async handleCron(): Promise<void> {
		try {
			await this.syncCronTask.execute();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	public startCron(): void {
		try {
			const job = this.schedulerRegistry.getCronJob(this.cronName);
			job.start();
			this.logger.info(`Started ${this.name}`);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	public stopCron(): void {
		try {
			const job = this.schedulerRegistry.getCronJob(this.cronName);
			job.stop();
			this.logger.warn(`Stopped ${this.name}`);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	public getLastJobDate(): Date | null {
		try {
			const job = this.schedulerRegistry.getCronJob(this.cronName);
			return job.lastDate();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
