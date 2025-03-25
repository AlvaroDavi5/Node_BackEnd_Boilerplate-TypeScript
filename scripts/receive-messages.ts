import envsConfig from '@core/configs/envs.config';
import { WebSocketEventsEnum } from '@domain/enums/events.enum';
import createWebSocketClient from '@dev/websocket/createWebSocketClient';
import { loggerProviderMock } from '@dev/mocks/mockedModules';


function formatMessageAfterReceiveHelper(message: unknown): string {
	let msg = '';
	try {
		msg = JSON.parse(message as unknown as string);
	} catch (error) {
		msg = String(message);
	}
	return msg;
}

function createSocketClient() {
	console.info(
		'\n # Creating socket client \n'
	);

	const webSocketClient = createWebSocketClient({
		configs: envsConfig(),
		logger: loggerProviderMock,
	});

	webSocketClient.listen(WebSocketEventsEnum.EMIT, (msg: unknown, ..._args: unknown[]) => {
		const message = formatMessageAfterReceiveHelper(msg);
		console.info(message);
	});
	webSocketClient.listen(WebSocketEventsEnum.ERROR, (msg: unknown, ..._args: unknown[]) => {
		console.error(msg);
	});
	webSocketClient.send(WebSocketEventsEnum.RECONNECT, {
		dataValues: {
			clientId: 'localDev#1',
		},
		listen: {
			newConnections: true,
		},
	});
}


createSocketClient();
