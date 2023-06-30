import { Module, Global } from '@nestjs/common';
import UserStrategy from '@modules/app/strategies/UserStrategy';
import UserOperation from '@modules/app/operations/UserOperation';
import UserService from '@modules/app/services/UserService';
import UserPreferenceService from '@modules/app/services/UserPreferenceService';
import SubscriptionService from '@modules/app/services/SubscriptionService';
import UserRepository from '@modules/app/repositories/user/UserRepository';
import UserPreferenceRepository from '@modules/app/repositories/userPreference/UserPreferenceRepository';


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
