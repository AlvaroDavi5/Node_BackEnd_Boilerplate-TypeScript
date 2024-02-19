'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Users', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				unique: true,
				primaryKey: true,
			},
			fullName: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING(70),
				allowNull: false,
				unique: true,
			},
			password: {
				type: Sequelize.STRING(550),
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING(16),
			},
			docType: {
				type: Sequelize.STRING(10),
			},
			document: {
				type: Sequelize.STRING(18),
			},
			fu: {
				type: Sequelize.STRING(2),
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date('2024-02-28T09:35:31.820'),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date('2024-02-28T09:35:31.820'),
			},
			deletedAt: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null,
			},
			deletedBy: {
				type: Sequelize.STRING(256),
				allowNull: true,
				defaultValue: null,
			}
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Users');
	}
};
