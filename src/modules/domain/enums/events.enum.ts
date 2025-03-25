
export enum QueueDomainEventsEnum {
	NEW_HOOK = 'NEW_HOOK',
}

export enum QueueSchemasEnum {
	DOMAIN_EVENT = 'DOMAIN_EVENT',
	BROADCAST = 'BROADCAST',
	NEW_CONNECTION = 'NEW_CONNECTION',
	DISABLE_ALL_ROUTES = 'DISABLE_ALL_ROUTES',
}

export enum EmitterEventsEnum {
	DISABLE_LOGIN = 'disable_login',
	DISABLE_ALL_ROUTES = 'disable_all_routes',
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
}
export enum WebSocketRoomsEnum {
	NEW_CONNECTIONS = 'new_connections',
}
