'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('UserPreferences', [
			{
				userId: 1,
				imagePath: './generic.png',
				defaultTheme: 'DARK',
			}
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('UserPreferences', null, {});
	}
};
