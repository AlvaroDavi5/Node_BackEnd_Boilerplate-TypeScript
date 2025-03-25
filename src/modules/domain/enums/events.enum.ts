
export enum QueueEventsEnum {
	INVALID = 'INVALID',
}

export enum EmitterEventsEnum {
	DISABLE_LOGIN = 'disable_login',
}

export enum WebSocketEventsEnum {
	// * Socket.io Events
	CONNECT = 'connection',
	DISCONNECT = 'disconnect',

	// ? External Events
	RECONNECT = 'reconnect',
	EMIT = 'emit',
	ERROR = 'error',

	// ? Internal Events
	EMIT_PRIVATE = 'emit_private',
	BROADCAST = 'broadcast',
	NEW_CONNECTION = 'new_connection',
}
export enum WebSocketRoomsEnum {
	NEW_CONNECTIONS = 'new_connections',
}
