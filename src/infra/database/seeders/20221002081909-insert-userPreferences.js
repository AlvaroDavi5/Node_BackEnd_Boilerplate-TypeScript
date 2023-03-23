'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('UserPreferences', [
			{
				userId: 1,
				imagePath: './',
				defaultTheme: '2',
			}
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('UserPreferences', null, {});
	}
};
