const { webSocketClient } = require('../../src/utils.js');


webSocketClient.send(
	'testEvent',
	JSON.stringify({
		origin: 'Rappi',
		integrator: 'Quiq',
		placedAt: new Date(),
		status: 'PLACED',
		posIntegrationError: 'INTEGRATION_FAILED_BUT_CONFIRM_ORDER',
		posIntegrationStatus: 'INTEGRATION_FAIL',
	})
);
