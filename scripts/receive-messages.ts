import createWebSocketClient from '../src/dev/websocket/createWebSocketClient';
import { WebSocketEventsEnum } from '../src/modules/domain/enums/webSocketEvents.enum';
import envsConfig from '../src/modules/core/configs/envs.config';


function formatMessageAfterReceiveHelper(message: unknown) {
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
		logger: console,
	});

	webSocketClient.listen(WebSocketEventsEnum.EMIT, (msg: unknown, ..._args: unknown[]) => {
		const message = formatMessageAfterReceiveHelper(msg);
		console.info(message);
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
