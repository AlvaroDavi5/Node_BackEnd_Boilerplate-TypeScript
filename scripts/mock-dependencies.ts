import createEventsQueue from '../dev/localstack/queues/createEventsQueue';
import MockedExternalServers from '../dev/mockedExternalServers/index';
import configs from '../configs/configs';


const logger = console;

async function mockServiceDependencies() {
	logger.info(
		'\n # Mocking service dependencies... \n # Update your projects env file \n'
	);

	const externalServices = new MockedExternalServers();
	externalServices.start();

	await createEventsQueue({
		logger,
		configs,
	});
}


mockServiceDependencies();
