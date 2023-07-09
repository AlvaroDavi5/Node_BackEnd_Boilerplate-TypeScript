
export class Consumer {
	handleMessageBatch: any;

	create({ queueUrl, batchSize, handleMessageBatch }: { queueUrl: String, batchSize: Number, handleMessageBatch: any }) {
		this.handleMessageBatch = handleMessageBatch;
		return {
			on: () => { },
		};
	}

	buildMessages(message: String) {
		const formatted = { Body: JSON.stringify(message) };
		return [formatted];
	}

	async processMessage(message: String) {
		const messages = this.buildMessages(message);
		await this.handleMessageBatch(messages);
	}
}

let consumer: Consumer;

export function getConsumerInstance() {
	if (!consumer) {
		consumer = new Consumer();
	}
	return consumer;
}
