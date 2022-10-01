'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert('tasks', [
			{
				user_id: 1,
				name: "Aplicar P4",
				deadline_date: "2021-09-24",
				deadline_time: "04:23:10.0000002",
				description: "Espero que todos tirem 10!"
			}
		], {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('tasks', null, {})
	}
}
