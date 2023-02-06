import WebSocketClient from '../../src/interface/webSocket/client/Client';


export default async ({ logger, configs }: any) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const webSocketClient = new WebSocketClient({ logger, configs });

	return webSocketClient;
};
