import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import envsConfig from '@core/configs/envs.config';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import ConnectionsModule from './connections/connections.module';
import { formatGraphQlError } from './utils/errors.util';


const { application: appConfigs } = envsConfig();

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: appConfigs.environment === EnvironmentsEnum.DEVELOPMENT,
			autoSchemaFile: join(process.cwd(), 'src/modules/graphql/schemas/schema.gql'),
			formatError: formatGraphQlError,
			include: [],
		}),
		ConnectionsModule,
	],
	controllers: [],
	providers: [],
	exports: [],
})
export default class GraphQlModule { }
