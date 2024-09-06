import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import LoggerService from '@core/logging/Logger.service';
import SyncCronTask from '@core/cron/tasks/SyncCron.task';
import { CronJobsEnum } from '../cronJobs.enum';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';


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
		this.cronName = CronJobsEnum.SyncCron;
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
		name: CronJobsEnum.SyncCron,
		timeZone: TimeZonesEnum.America_SaoPaulo,
		disabled: false,
		unrefTimeout: false,
	})
	public async handleCron(): Promise<void> {
		await this.syncCronTask.execute();
	}

	public startCron(): void {
		const job = this.schedulerRegistry.getCronJob(this.cronName);
		job.start();
		this.logger.info(`Started ${this.name}`);
	}

	public stopCron(): void {
		const job = this.schedulerRegistry.getCronJob(this.cronName);
		job.stop();
		this.logger.warn(`Stopped ${this.name}`);
	}

	public getLastJobDate(): Date | null {
		const job = this.schedulerRegistry.getCronJob(this.cronName);
		return job.lastDate();
	}
}
