import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	MongoClient as MongoDBClient, FindCursor, WithId, ServerApiVersion,
	Db, Document, Collection, ObjectId,
	InsertOneResult, InsertManyResult, UpdateResult, DeleteResult,
} from 'mongodb';
import { ConfigsInterface } from '@configs/configs.config';
import Exceptions from '@infra/errors/Exceptions';


export type documentObjectType = { [index: string]: any }

@Injectable()
export default class MongoClient {
	private readonly mongoClient: MongoDBClient;
	public readonly databases: {
		datalake: Db;
	};

	public isConnected: boolean;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
	) {
		const { mongo, databases }: ConfigsInterface['data'] = this.configService.get<any>('data');

		this.mongoClient = new MongoDBClient(String(mongo.uri), {
			maxConnecting: mongo.maxConnecting,
			maxPoolSize: mongo.maxPoolSize,
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		this.isConnected = this.connect();

		this.databases = {
			datalake: this.mongoClient.db(databases.datalake),
		};
	}

	public getClient(): MongoDBClient {
		return this.mongoClient;
	}

	private connect(): boolean {
		this.mongoClient.connect()
			.then(() => {
				this.isConnected = true;
			})
			.catch((error) => {
				throw this.exceptions.integration({
					message: 'Error to connect mongo client',
				});
			});
		return this.isConnected;
	}

	public async close(): Promise<void> {
		try {
			return await this.mongoClient.close();
		} catch (error) {
			throw this.exceptions.integration({
				message: 'Error to close mongo client',
			});
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
		const collectionNames: string[] = collectionList.map(collection => collection.name);

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

	public async findOne(collection: Collection<Document>, insertedId: ObjectId): Promise<WithId<Document> | null> {
		return await collection.findOne({ _id: insertedId });
	}

	public findMany(collection: Collection<Document>, insertedId: ObjectId): FindCursor<WithId<Document>> {
		return collection.find({ _id: insertedId });
	}

	public async updateOne(collection: Collection<Document>, insertedId: ObjectId, newData: documentObjectType): Promise<UpdateResult<Document>> {
		return await collection.updateOne({ _id: insertedId }, { $set: newData });
	}

	public async updateMany(collection: Collection<Document>, insertedId: ObjectId, newData: documentObjectType): Promise<UpdateResult<Document>> {
		return await collection.updateMany({ _id: insertedId }, { $set: newData });
	}

	public async deleteOne(collection: Collection<Document>, insertedId: ObjectId): Promise<DeleteResult> {
		return await collection.deleteOne({ _id: insertedId });
	}

	public async deleteMany(collection: Collection<Document>, insertedId: ObjectId): Promise<DeleteResult> {
		return await collection.deleteMany({ _id: insertedId });
	}
}
