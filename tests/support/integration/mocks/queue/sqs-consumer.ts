
export class Consumer {
	handleMessageBatch: any;

	create({ queueUrl, batchSize, handleMessageBatch }: { queueUrl: string, batchSize: number, handleMessageBatch: any }) {
		this.handleMessageBatch = handleMessageBatch;
		return {
			on: () => { },
		};
	}

	buildMessages(message: string) {
		const formatted = { Body: JSON.stringify(message) };
		return [formatted];
	}

	async processMessage(message: string) {
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
