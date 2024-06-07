import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CreateConnectionInputDto, UpdateConnectionInputDto } from '../dto/ConnectionInput.dto';
import SubscriptionEntity from '@domain/entities/Subscription.entity';
import SubscriptionService from '@app/subscription/services/Subscription.service';


@Injectable()
export default class ConnectionService implements OnModuleInit {
	private subscriptionService!: SubscriptionService;

	constructor(
		private readonly moduleRef: ModuleRef,
	) { }

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	public async findAll(): Promise<SubscriptionEntity[]> {
		return await this.subscriptionService.list();
	}

	public async findOne(subscriptionId: string): Promise<SubscriptionEntity> {
		return await this.subscriptionService.get(subscriptionId);
	}

	public async create(createConnectionInputDto: CreateConnectionInputDto): Promise<SubscriptionEntity> {
		return await this.subscriptionService.save(createConnectionInputDto.subscriptionId, createConnectionInputDto);
	}

	public async update(updateConnectionInputDto: UpdateConnectionInputDto): Promise<SubscriptionEntity> {
		return await this.subscriptionService.save(updateConnectionInputDto.subscriptionId as string, updateConnectionInputDto);
	}

	public async remove(subscriptionId: string): Promise<boolean> {
		return await this.subscriptionService.delete(subscriptionId);
	}
}
