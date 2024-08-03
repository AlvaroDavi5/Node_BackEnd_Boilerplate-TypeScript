import { ConfigsInterface } from '@core/configs/envs.config';
import { LoggerInterface } from '@core/logging/logger';
import WebSocketClient from './WebSocketClient';


export default ({ logger, configs }: { configs: ConfigsInterface, logger: LoggerInterface }): WebSocketClient => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const webSocketClient = new WebSocketClient({ logger, configs });

	return webSocketClient;
};
