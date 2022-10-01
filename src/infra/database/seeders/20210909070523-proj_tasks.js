'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert('proj_tasks', [
			{
				proj_id: 1,
				task_num: 2,
				name: "Criar Banco de Dados",
				description: "Sem database, sem dados. dãã!!!",
				deadline: "2021-09-25",
				situation: 3,
				was_finished: true
			}
		], {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('proj_tasks', null, {})
	}
}
