import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import SubscriptionEntity from '@domain/entities/Subscription.entity';
import ConnectionsService from '../services/Connection.service';
import CreateConnectionInputDto from '../dto/CreateConnectionInput.dto';
import UpdateConnectionInputDto from '../dto/UpdateConnectionInput.dto';


@Resolver(() => SubscriptionEntity)
export class ConnectionResolver {
	constructor(
		private readonly connectionsService: ConnectionsService,
	) { }

	@Mutation(() => SubscriptionEntity)
	public async createConnection(@Args('createConnectionInput') createConnectionInputDto: CreateConnectionInputDto): Promise<SubscriptionEntity> {
		return await this.connectionsService.create(createConnectionInputDto);
	}

	@Query(() => [SubscriptionEntity], { name: 'findConnections' })
	public findConnections() {
		return this.connectionsService.findAll();
	}

	@Query(() => SubscriptionEntity, { name: 'findConnection' })
	public findConnection(@Args('subscriptionId', { type: () => String }) subscriptionId: string) {
		return this.connectionsService.findOne(subscriptionId);
	}

	@Mutation(() => SubscriptionEntity)
	public updateConnection(@Args('updateConnectionInput') updateConnectionInputDto: UpdateConnectionInputDto) {
		return this.connectionsService.update(updateConnectionInputDto);
	}

	@Mutation(() => SubscriptionEntity)
	public removeConnection(@Args('subscriptionId', { type: () => String }) subscriptionId: string) {
		return this.connectionsService.remove(subscriptionId);
	}
}
