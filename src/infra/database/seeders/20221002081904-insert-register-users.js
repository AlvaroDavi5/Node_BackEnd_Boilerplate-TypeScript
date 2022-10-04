'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('Users', [
			{
				fullName: 'Tester',
				email: 'tester@nomail.test',
				password: 'pass',
				phone: '000000000',
				docType: 'invalid',
				document: '00000000000',
				fu: 'BA',
			}
		], {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Users', null, {});
	}
};
