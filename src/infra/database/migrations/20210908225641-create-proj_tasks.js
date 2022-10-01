'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('proj_tasks', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true
			},
			proj_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'projects',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
			},
			task_num: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			name: {
				type: Sequelize.STRING(100)
			},
			description: {
				type: Sequelize.STRING(355)
			},
			deadline: {
				type: Sequelize.DATE
			},
			situation: {
				type: Sequelize.INTEGER
			},
			was_finished: {
				type: Sequelize.BOOLEAN
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
		await queryInterface.dropTable('proj_tasks')
	}
}
