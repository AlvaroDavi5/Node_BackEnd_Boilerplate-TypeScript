
export enum WebSocketEventsEnum {
	// * Socket.io Events
	CONNECT = 'connection',
	DISCONNECT = 'disconnect',

	// ? External Events
	RECONNECT = 'reconnect',
	EMIT = 'emit',

	// ! Internal Events
	EMIT_PRIVATE = 'emit-private',
	BROADCAST = 'broadcast',
}
