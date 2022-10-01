'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert('bibliographies', [
			{
				user_id: 1,
				author: "Alan Turing",
				name: "Máquinas Podem Pensar?",
				publication_date: "1957-10-01"
			}
		], {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('bibliographies', null, {})
	}
}
