import createEnum from './createEnum';

export default createEnum({
	// * Socket.io Events
	CONNECT: 'connection',
	DISCONNECT: 'disconnect',

	// ! Internal Events
	EMIT_PRIVATE: 'emit-private',
	BROADCAST: 'broadcast',
});
