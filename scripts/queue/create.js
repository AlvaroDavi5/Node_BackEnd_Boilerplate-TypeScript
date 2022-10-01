const dotenv = require('dotenv');
dotenv.config();
const { createQueue } = require('../../src/queue/sqs.js');

const queueName = process.env.QUEUE_NAME || 'DEFAULT_QUEUE.fifo';

createQueue(queueName);
