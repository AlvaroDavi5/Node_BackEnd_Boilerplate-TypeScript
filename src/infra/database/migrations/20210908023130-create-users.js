'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('users', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				unique: true,
				primaryKey: true
			},
			name: {
				type: Sequelize.STRING(85),
				allowNull: false
			},
			email: {
				type: Sequelize.STRING(60),
				allowNull: false
			},
			password: {
				type: Sequelize.STRING(65),
				allowNull: false
			},
			phone: {
				type: Sequelize.STRING(14)
			},
			cpf: {
				type: Sequelize.STRING(18)
			},
			uf: {
				type: Sequelize.STRING(2)
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date()
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: new Date()
			}
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('users')
	}
}
