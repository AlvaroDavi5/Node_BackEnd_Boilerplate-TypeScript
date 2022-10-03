'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('userPreferences', [
			{
				userId: 1,
				imagePath: './',
				defaultTheme: 1,
			}
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('userPreferences', null, {});
	}
};
