import { Options, BuildOptions, Dialect } from 'sequelize/types'


export interface DatabaseConfig {
	database: string | undefined,
	username: string | undefined,
	password: string | undefined,
	dialect: Dialect | undefined,
	host: string | undefined,
	port: number | undefined,
	charset?: string | undefined,
	dialectOptions?: {
		ssl: {
			rejectUnauthorized: boolean
		}
	},
	define?: {
		underscored: boolean,
		timestamps: boolean,
		freezeTableName: boolean
	},
	options?: Options | undefined,
	buildOptions?: BuildOptions | undefined
}
