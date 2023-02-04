import WebSocketClient from '../../src/interface/webSocket/client/Client';


export default async ({ formatMessageBeforeSendHelper, logger, config }) => {
	const webSocketClient = new WebSocketClient({ formatMessageBeforeSendHelper, logger, config });

	return webSocketClient;
};
