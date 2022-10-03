'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('UserPreferences', [
			{
				userId: 1,
				imagePath: './',
				defaultTheme: 1,
			}
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('UserPreferences', null, {});
	}
};
