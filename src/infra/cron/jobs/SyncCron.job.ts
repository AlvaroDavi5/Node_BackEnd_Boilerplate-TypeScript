import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import SyncCronTask from '../tasks/SyncCron.task';


@Injectable()
export default class SyncCronJob {
	public readonly name: string;
	public readonly cronExpression: CronExpression;

	constructor(
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly syncCronTask: SyncCronTask,
	) {
		this.name = SyncCronJob.name;
		this.cronExpression = CronExpression.EVERY_5_MINUTES;
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
		name: SyncCronJob.name,
		timeZone: 'America/Sao_Paulo',
		disabled: false,
		unrefTimeout: false,
	})
	public async handleCron(): Promise<void> {
		await this.syncCronTask.execute();
	}

	public stopCron(): void {
		const job = this.schedulerRegistry.getCronJob(this.name);
		job.stop();
	}

	public getLastJobDate(): Date {
		const job = this.schedulerRegistry.getCronJob(this.name);
		return job.lastDate();
	}
}
