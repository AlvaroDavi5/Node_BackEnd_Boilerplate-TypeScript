
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
}

export enum WebSocketRoomsEnum {
	NEW_CONNECTIONS = 'new_connections',
}
