import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	MongoClient as MongoDBClient, WithId, ServerApiVersion,
	Db, Document, Collection, ObjectId,
	InsertOneResult, InsertManyResult, UpdateResult, DeleteResult,
} from 'mongodb';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type documentObjectType = { [key: string]: any }

@Injectable()
export default class MongoClient {
	private readonly mongoClient: MongoDBClient;
	public readonly databases: {
		datalake: {
			db: Db,
			collections: {
				subscriptions: string,
				unprocessedMessages: string,
			},
		},
	};

	public isConnected: boolean;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
	) {
		const { mongo, databases } = this.configService.get<ConfigsInterface['data']>('data')!;

		this.mongoClient = new MongoDBClient(String(mongo.uri), {
			maxConnecting: mongo.maxConnecting,
			maxPoolSize: mongo.maxPoolSize,
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		this.isConnected = true;

		this.databases = {
			datalake: {
				db: this.mongoClient.db(databases.datalake.name),
				collections: databases.datalake.collections,
			}
		};
	}

	public getClient(): MongoDBClient {
		return this.mongoClient;
	}

	public async connect(): Promise<boolean> {
		try {
			await this.mongoClient.connect();
			this.isConnected = true;
		} catch (error) {
			this.isConnected = false;
			throw this.exceptions.integration({
				message: 'Error to connect mongo client',
				details: (error as Error)?.message,
			});
		}
		return this.isConnected;
	}

	public async disconnect(): Promise<boolean> {
		try {
			await this.mongoClient.close();
			this.isConnected = false;

			return true;
		} catch (error) {
			return false;
		}
	}

	public runCommand(database: Db, command: documentObjectType): Promise<Document> {
		if (!database) {
			throw this.exceptions.conflict({
				message: 'Database unexistent',
			});
		}
		return database.command(command);
	}

	public async listCollections(database: Db): Promise<string[]> {
		if (!database) {
			throw this.exceptions.conflict({
				message: 'Database unexistent',
			});
		}
		const collectionList = await database.listCollections().toArray();
		const collectionNames: string[] = collectionList.map((collection) => collection.name);

		return collectionNames;
	}

	public getCollection(database: Db, collectionName: string): Collection<Document> {
		if (!database) {
			throw this.exceptions.conflict({
				message: 'Database unexistent',
			});
		}
		return database.collection<Document>(collectionName);
	}

	public async createCollection(database: Db, collectionName: string): Promise<Collection<Document>> {
		if (!database) {
			throw this.exceptions.conflict({
				message: 'Database unexistent',
			});
		}
		return await database.createCollection<Document>(collectionName);
	}

	public async dropCollection(database: Db, collectionName: string): Promise<boolean> {
		if (!database) {
			throw this.exceptions.conflict({
				message: 'Database unexistent',
			});
		}
		return await database.dropCollection(collectionName);
	}

	public async insertOne(collection: Collection<Document>, data: documentObjectType): Promise<InsertOneResult<Document>> {
		return await collection.insertOne(data);
	}

	public async insertMany(collection: Collection<Document>, dataList: documentObjectType[]): Promise<InsertManyResult<Document>> {
		return await collection.insertMany(dataList);
	}

	public async get(collection: Collection<Document>, id: ObjectId): Promise<WithId<Document> | null> {
		return await collection.findOne({ _id: id });
	}

	public async findOne(collection: Collection<Document>, filterData: documentObjectType): Promise<WithId<Document> | null> {
		return await collection.findOne(filterData);
	}

	public async findMany(collection: Collection<Document>, filterData: documentObjectType): Promise<WithId<Document>[]> {
		return collection.find(filterData).toArray();
	}

	public async updateOne(collection: Collection<Document>, id: ObjectId, newData: documentObjectType): Promise<UpdateResult<Document>> {
		return await collection.updateOne({ _id: id }, { $set: newData });
	}

	public async updateMany(collection: Collection<Document>, filterData: documentObjectType, newData: documentObjectType): Promise<UpdateResult<Document>> {
		return await collection.updateMany(filterData, { $set: newData });
	}

	public async deleteOne(collection: Collection<Document>, id: ObjectId): Promise<DeleteResult> {
		return await collection.deleteOne({ _id: id });
	}

	public async deleteMany(collection: Collection<Document>, filterData: documentObjectType): Promise<DeleteResult> {
		return await collection.deleteMany(filterData);
	}
}
