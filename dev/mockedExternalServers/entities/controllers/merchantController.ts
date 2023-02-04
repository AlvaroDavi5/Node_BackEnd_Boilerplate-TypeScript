import { Router } from 'express';
import listMerchants from '../data/listOfMerchants';
import getMerchant from '../data/merchant';

let toggle = 0;

export default {
	listMerchant: async (req: any, res: any) => {
		const { authorization } = req.headers;
		console.log('\n#Request Received');
		console.log('#Service: Entities');
		console.log(`#Path: /merchant${req.path}`);
		console.log('#Params: ', req.params);
		console.log('#Has Token: ', !!authorization);
		const merchants = listMerchants();

		toggle++;
		if (toggle >= 3) {
			toggle = 0;
			return res.status(500).send();
		}
		if (!authorization) return res.status(401).send();
		return res.status(200).send(merchants);
	},
	getMerchant: async (req, res) => {
		console.log('\n#Request Received');
		console.log('#Service: Entities');
		console.log('#Path: /merchant', req.path);
		console.log('#Params: ', req.params);
		const merchantId = req.params.merchantId || 1;
		const merchant = getMerchant(merchantId);
		return res.status(200).send(merchant);
	},

	router() {
		const router = Router();

		router.get('/user', this.listMerchant);
		router.get('/:merchantId', this.getMerchant);

		return router;
	},
};
