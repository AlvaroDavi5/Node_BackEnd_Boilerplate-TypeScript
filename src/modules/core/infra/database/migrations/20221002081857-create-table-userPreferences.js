'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('UserPreferences', {
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
				references: {
					model: 'Users', // table name, not model name
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
			},
			imagePath: {
				type: Sequelize.STRING(255),
			},
			defaultTheme: {
				type: Sequelize.STRING(20),
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date('2024-06-10T03:52:50.885Z'),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date('2024-06-10T03:52:50.885Z'),
			},
			deletedAt: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null,
			}
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('UserPreferences');
	}
};
