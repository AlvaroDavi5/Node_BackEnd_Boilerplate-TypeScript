import webSocketEventsEnum from 'src/domain/enums/webSocketEventsEnum';
import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	webSocketClient,
}: ContainerInterface) => ({
	execute: (msg: any): any => {
		webSocketClient.send(webSocketEventsEnum.EMIT, msg);

		return true;
	}
});
