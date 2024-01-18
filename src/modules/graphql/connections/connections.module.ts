import { Module } from '@nestjs/common';
import { ConnectionResolver } from './resolvers/connection.resolver';
import ConnectionService from './services/Connection.service';


@Module({
	imports: [],
	controllers: [],
	providers: [
		ConnectionResolver,
		ConnectionService,
	],
	exports: [],
})
export default class ConnectionsModule { }
