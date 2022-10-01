const { webSocketClient } = require('../../src/utils.js');


webSocketClient.receive('testEvent', (msg) => {
	console.log(JSON.parse(msg));
});
