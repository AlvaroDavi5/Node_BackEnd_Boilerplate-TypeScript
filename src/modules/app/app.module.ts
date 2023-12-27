import { Module, Global } from '@nestjs/common';
import FileStrategy from '@app/strategies/File.strategy';
import UserStrategy from '@app/strategies/User.strategy';
import UserOperation from '@app/operations/User.operation';
import UserService from '@app/services/User.service';
import UserPreferenceService from '@app/services/UserPreference.service';
import SubscriptionService from '@app/services/Subscription.service';
import UserRepository from '@app/repositories/user/User.repository';
import UserPreferenceRepository from '@app/repositories/userPreference/UserPreference.repository';


@Global()
@Module({
	imports: [],
	controllers: [],
	providers: [
		FileStrategy,
		UserStrategy,
		UserOperation,
		UserService,
		UserPreferenceService,
		SubscriptionService,
		UserRepository,
		UserPreferenceRepository,
	],
	exports: [
		FileStrategy,
		UserOperation,
		SubscriptionService,
	],
})
export default class AppModule { }
