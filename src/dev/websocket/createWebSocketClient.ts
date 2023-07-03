import WebSocketClient from './WebSocketClient';


export default ({ logger, configs }: any): WebSocketClient => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const webSocketClient = new WebSocketClient({ logger, configs });

	return webSocketClient;
};
