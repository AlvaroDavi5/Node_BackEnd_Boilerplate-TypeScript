'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('userPreferences', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				unique: true,
				primaryKey: true,
			},
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			imagePath: {
				type: Sequelize.STRING(255),
			},
			defaultTheme: {
				type: Sequelize.INTEGER,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date(),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date(),
			}
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('userPreferences');
	}
};
