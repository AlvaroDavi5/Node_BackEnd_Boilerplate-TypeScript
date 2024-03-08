import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CreateConnectionInputDto, UpdateConnectionInputDto } from '../dto/ConnectionInput.dto';
import SubscriptionEntity from '@domain/entities/Subscription.entity';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import Exceptions from '@core/infra/errors/Exceptions';


@Injectable()
export default class ConnectionService implements OnModuleInit {
	private subscriptionService!: SubscriptionService;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly exceptions: Exceptions,
	) { }

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	public async findAll(): Promise<SubscriptionEntity[]> {
		return await this.subscriptionService.list();
	}

	public async findOne(subscriptionId: string): Promise<SubscriptionEntity> {
		const subscription = await this.subscriptionService.get(subscriptionId);

		if (!subscription)
			throw this.exceptions.notFound({
				message: 'Subscription not found!'
			});

		return subscription;
	}

	public async create(createConnectionInputDto: CreateConnectionInputDto): Promise<SubscriptionEntity> {
		const subscription = await this.subscriptionService.save(createConnectionInputDto.subscriptionId, createConnectionInputDto);

		if (!subscription)
			throw this.exceptions.conflict({
				message: 'Subscription not created!'
			});

		return subscription;
	}

	public async update(updateConnectionInputDto: UpdateConnectionInputDto): Promise<SubscriptionEntity> {
		const subscription = await this.subscriptionService.save(updateConnectionInputDto.subscriptionId as string, updateConnectionInputDto);

		if (!subscription)
			throw this.exceptions.conflict({
				message: 'Subscription not updated!'
			});

		return subscription;
	}

	public async remove(subscriptionId: string): Promise<boolean> {
		const subscriptionDeleted = await this.subscriptionService.delete(subscriptionId);

		return subscriptionDeleted;
	}
}
