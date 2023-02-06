import createEventsQueue from '../dev/localstack/queues/createEventsQueue';
import MockedExternalServers from '../dev/mockedExternalServers/index';
import connection, { syncConnection, testConnection } from '../src/infra/database/connection';
import configs from '../configs/configs';


const logger = console;

async function mockServiceDependencies() {
	logger.log(
		'\n # Mocking service dependencies... \n # Update your projects env file \n'
	);

	const externalServices = new MockedExternalServers();
	externalServices.start();

	await createEventsQueue({
		logger,
		configs,
	});

	const isConnected = await testConnection(connection);
	if (!isConnected) {
		await syncConnection(connection);
	}
}


mockServiceDependencies();
