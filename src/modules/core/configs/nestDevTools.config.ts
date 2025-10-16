import { DynamicModule } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


export default function devToolsFactory(port: number, environment: string): DynamicModule[] {
	if (environment !== EnvironmentsEnum.DEVELOPMENT)
		return [];

	const devToolsModule = DevtoolsModule.register({
		http: true,
		port,
	});

	return [devToolsModule];
}
