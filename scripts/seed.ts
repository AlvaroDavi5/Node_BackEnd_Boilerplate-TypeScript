import { DataSource } from 'typeorm';
import { dbConfig } from '@core/infra/database/db.config';
import { testConnection } from '@core/infra/database/connection';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';


async function getConnection(): Promise<DataSource> {
	const connection = new DataSource(dbConfig);

	const isInitialized = await testConnection(connection, console);

	if (isInitialized)
		return connection;

	return await connection.initialize();
}

function getRepositories(connection: DataSource) {
	UsersModel.useDataSource(connection);
	UserPreferencesModel.useDataSource(connection);

	const userRepository = UsersModel.getRepository();
	const userPreferenceRepository = UserPreferencesModel.getRepository();

	return {
		userRepository,
		userPreferenceRepository,
	};
}

async function seedDatabase(): Promise<void> {
	const connection = await getConnection();
	const { userRepository, userPreferenceRepository } = getRepositories(connection);

	console.info(
		'\n # Seeding database \n'
	);

	const testUser = await userRepository.create({
		document: '12312312345', docType: 'CPF', fu: 'SP',
		fullName: 'Tester User', email: 'tester.user@nomail.com',
		password: '$2b$10$KuaNFAgwY.RJfRLhS0kDVu|D73SxsNl_H6yaDzjE_-ZAJCorFvEnN1WG3bn8ICGA-Y',
	}).save();
	await userPreferenceRepository.create({
		user: { id: testUser.id },
		defaultTheme: 'DARK',
		imagePath: './generic.png',
	}).save();
}

seedDatabase();
