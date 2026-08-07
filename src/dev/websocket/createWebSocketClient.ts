import { ConfigsInterface } from '@core/configs/envs.config';
import { LoggerInterface } from '@core/logging/logger';
import WebSocketClient from './WebSocketClient';


export default ({ logger, configs }: { configs: ConfigsInterface, logger: LoggerInterface }): WebSocketClient => {
	// oxlint-disable-next-line typescript/ban-ts-comment
	// @ts-ignore
	const webSocketClient = new WebSocketClient({ logger, configs });

	return webSocketClient;
};
