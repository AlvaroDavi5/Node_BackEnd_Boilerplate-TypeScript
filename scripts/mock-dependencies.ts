import createEventsQueue from '../src/dev/localstack/queues/createEventsQueue';
import MockedExternalServers from '../src/dev/mockedExternalServers/index';
import configs from '../src/modules/core/configs/configs.config';


function mockServiceDependencies() {
	console.info(
		'\n # Mocking service dependencies... \n # Update your projects env file \n'
	);

	const externalServices = new MockedExternalServers();
	externalServices.start();

	createEventsQueue({
		logger: console,
		configs: configs(),
	});
}


mockServiceDependencies();
