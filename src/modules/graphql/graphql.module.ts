import { Module } from '@nestjs/common';
import ConnectionsModule from './connections/connections.module';


@Module({
	imports: [
		ConnectionsModule,
	],
	controllers: [],
	providers: [],
	exports: [],
})
export default class GraphQlModule { }
