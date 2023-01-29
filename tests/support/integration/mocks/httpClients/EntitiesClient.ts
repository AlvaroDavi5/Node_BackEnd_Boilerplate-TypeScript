
export default class EntitiesClient {
	logger: any;

	constructor({ logger }) {
		this.logger = logger;
	}

	async getAllMerchantsThatUserHasAccess(token = '') {
		const merchantIds = [...Array(5).keys()];

		if (token?.length) {
			return merchantIds;
		}

		return [];
	}
}
