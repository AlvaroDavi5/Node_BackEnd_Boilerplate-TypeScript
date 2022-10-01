'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert('users', [
			{
				name: "Alvaro",
				email: "alvaro-alves@nomail.edu",
				password: "ee7d81103f122bb171ce1eb2b8da9b44403f2b2da7924b48b3fafe0ba36b5a81",
				phone: "27999999999",
				cpf: "000.123.111-60",
				uf: "BA"
			},
			{
				name: "Davi",
				email: "davi-santos@nomail.edu",
				password: "3c1adf97d2248bd1318703065adda1e9c07b67f869d490931549e51e2a8ba159",
				phone: "279898988998",
				cpf: "000.124.111-60",
				uf: "ES"
			}
		], {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('users', null, {})
	}
}
