const dotenv = require('dotenv');
dotenv.config();
const { getMessage } = require('../../src/queue/sqs.js');

const queueFullUrl = process.env.QUEUE_FULL_URL || 'http://localhost:4566/000000000000/';
const queueName = process.env.QUEUE_NAME || 'DEFAULT_QUEUE.fifo';

getMessage(
	`${queueFullUrl}${queueName}`,
);
