import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CreateConnectionInputDto, UpdateConnectionInputDto } from '../dto/ConnectionInput.dto';
import SubscriptionEntity from '@app/domain/entities/Subscription.entity';
import ConnectionsService from '../services/Connection.service';


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
