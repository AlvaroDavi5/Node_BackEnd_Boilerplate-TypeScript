import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import SyncCronTask from '@core/infra/cron/tasks/SyncCron.task';
import { CronJobsEnum } from '../cronJobs.enum';


@Injectable()
export default class SyncCronJob {
	public readonly name: string;
	public readonly cronName: string;
	public readonly cronExpression: CronExpression;
	private readonly logger: Logger;

	constructor(
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly syncCronTask: SyncCronTask,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.name = SyncCronJob.name;
		this.cronName = CronJobsEnum.SyncCron;
		this.cronExpression = CronExpression.EVERY_5_MINUTES;
		this.logger = this.loggerGenerator.getLogger();
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
		// // every 5 minutes
		name: CronJobsEnum.SyncCron,
		timeZone: 'America/Sao_Paulo',
		disabled: false,
		unrefTimeout: false,
	})
	public async handleCron(): Promise<void> {
		await this.syncCronTask.execute();
	}

	public startCron(): void {
		const job = this.schedulerRegistry.getCronJob(this.cronName);
		job.start();
	}

	public stopCron(): void {
		const job = this.schedulerRegistry.getCronJob(this.cronName);
		job.stop();
	}

	public getLastJobDate(): Date {
		const job = this.schedulerRegistry.getCronJob(this.cronName);
		return job.lastDate();
	}
}
