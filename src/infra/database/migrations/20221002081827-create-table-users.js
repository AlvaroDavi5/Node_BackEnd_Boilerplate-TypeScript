'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('users', {
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
			},
			password: {
				type: Sequelize.STRING(60),
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING(16),
			},
			docType: {
				type: Sequelize.STRING(10),
			},
			cpf: {
				type: Sequelize.STRING(18),
			},
			fu: {
				type: Sequelize.STRING(2),
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
		await queryInterface.dropTable('users');
	}
};
