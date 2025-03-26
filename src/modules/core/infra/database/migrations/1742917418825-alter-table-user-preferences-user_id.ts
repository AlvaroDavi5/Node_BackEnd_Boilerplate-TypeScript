/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableUserPreferencesUserId1742917418825 implements MigrationInterface {
	name = 'AlterTableUserPreferencesUserId1742917418825';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "UserPreferences" DROP CONSTRAINT "user_id"');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "createdAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "createdAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "updatedAt" SET DEFAULT \'NOW()\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ADD CONSTRAINT "FK_5f8256554b2eec66fda266f625b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "UserPreferences" DROP CONSTRAINT "FK_5f8256554b2eec66fda266f625b"');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "updatedAt" SET DEFAULT \'2025-03-25 15:43:18.081353\'');
		await queryRunner.query('ALTER TABLE "Users" ALTER COLUMN "createdAt" SET DEFAULT \'2025-03-25 15:43:18.081353\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "updatedAt" SET DEFAULT \'2025-03-25 15:43:18.081353\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ALTER COLUMN "createdAt" SET DEFAULT \'2025-03-25 15:43:18.081353\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ADD CONSTRAINT "user_id" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE');
	}
}
/* eslint-enable max-len */
