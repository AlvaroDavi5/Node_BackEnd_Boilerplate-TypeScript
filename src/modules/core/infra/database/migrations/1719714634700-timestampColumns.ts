
import { MigrationInterface, QueryRunner } from 'typeorm';


export class TimestampColumns1719714634700 implements MigrationInterface {
	name = 'TimestampColumns1719714634700';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "createdAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" SET NOT NULL');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "createdAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "updatedAt" SET NOT NULL');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "updatedAt" SET DEFAULT \'NOW()\'');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "updatedAt" DROP DEFAULT');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "updatedAt" DROP NOT NULL');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "createdAt" SET DEFAULT \'2024-06-30 02:24:41.028771\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" DROP DEFAULT');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" DROP NOT NULL');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "createdAt" SET DEFAULT \'2024-06-30 02:24:41.028771\'');
	}
}

