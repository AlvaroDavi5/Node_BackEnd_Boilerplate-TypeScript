import createEventsQueue from '../src/dev/localstack/queues/createEventsQueue';
import MockedExternalServers from '../src/dev/mockedExternalServers/index';
import configs from '../src/configs/configs.config';


const logger = console;

function mockServiceDependencies() {
	logger.info(
		'\n # Mocking service dependencies... \n # Update your projects env file \n'
	);

	const externalServices = new MockedExternalServers();
	externalServices.start();

	createEventsQueue({
		logger,
		configs: configs(),
	});
}


mockServiceDependencies();
