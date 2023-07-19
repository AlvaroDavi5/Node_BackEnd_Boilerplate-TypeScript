import { Module, Global } from '@nestjs/common';
import UserStrategy from '@modules/app/strategies/User.strategy';
import UserOperation from '@modules/app/operations/User.operation';
import UserService from '@modules/app/services/User.service';
import UserPreferenceService from '@modules/app/services/UserPreference.service';
import SubscriptionService from '@modules/app/services/Subscription.service';
import UserRepository from '@modules/app/repositories/user/User.repository';
import UserPreferenceRepository from '@modules/app/repositories/userPreference/UserPreference.repository';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		UserStrategy,
		UserOperation,
		UserService,
		UserPreferenceService,
		SubscriptionService,
		UserRepository,
		UserPreferenceRepository,
	],
	exports: [
		UserOperation,
		SubscriptionService,
	],
})
export default class AppModule { }
