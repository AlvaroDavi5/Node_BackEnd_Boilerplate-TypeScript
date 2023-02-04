export default (merchantId) => ({
	id: merchantId || 1,
	autoAccept: true,
	autoReady: false,
	autoStatusChange: false,
	posChannel: null,
	statusPos: null,
	pdvStatusUpdate: true,
	integrationToken: 'token',
});
