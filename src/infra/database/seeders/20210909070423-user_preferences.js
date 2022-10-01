'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert('user_preferences', [
			{
				user_id: 1,
				image_path: "./aqui/essa.png",
				default_theme: 2
			}
		], {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('user_preferences', null, {})
	}
}
