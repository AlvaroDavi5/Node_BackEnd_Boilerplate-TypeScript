/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from 'typeorm';


/*
? filename pattern:
* {timestamp}-{action}-{resource}-{resource_name}
// 1716537514967-create-database-schema
// 1716537514967-update-table-users
*/
export class CreateDatabaseSchema1716537514967 implements MigrationInterface {
	name = 'CreateDatabaseSchema1716537514967';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('CREATE TABLE "UserPreferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imagePath" character varying(260), "defaultTheme" character varying(20), "createdAt" TIMESTAMP NOT NULL DEFAULT \'NOW()\', "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "REL_5f8256554b2eec66fda266f625" UNIQUE ("userId"), CONSTRAINT "PK_cc3107400805135c48b8035b693" PRIMARY KEY ("id")); COMMENT ON COLUMN "UserPreferences"."imagePath" IS \'User profile image path\'; COMMENT ON COLUMN "UserPreferences"."defaultTheme" IS \'User default theme\'; COMMENT ON COLUMN "UserPreferences"."createdAt" IS \'User creation timestamp\'; COMMENT ON COLUMN "UserPreferences"."updatedAt" IS \'User updated timestamp\'; COMMENT ON COLUMN "UserPreferences"."deletedAt" IS \'User deleted timestamp\'');
		await queryRunner.query('COMMENT ON TABLE "UserPreferences" IS \'User Preferences data structure\'');
		await queryRunner.query('CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(100) NOT NULL DEFAULT \'\', "email" character varying(70) NOT NULL DEFAULT \'\', "password" character varying(550) NOT NULL DEFAULT \'\', "phone" character varying(16), "docType" character varying(10), "document" character varying(18), "fu" character varying(2), "createdAt" TIMESTAMP NOT NULL DEFAULT \'NOW()\', "updatedAt" TIMESTAMP, "deletedAt" TIMESTAMP, "deletedBy" character varying(260), CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id")); COMMENT ON COLUMN "Users"."fullName" IS \'User name\'; COMMENT ON COLUMN "Users"."email" IS \'User email\'; COMMENT ON COLUMN "Users"."password" IS \'User password\'; COMMENT ON COLUMN "Users"."phone" IS \'User phone number\'; COMMENT ON COLUMN "Users"."docType" IS \'Document type\'; COMMENT ON COLUMN "Users"."document" IS \'Document code\'; COMMENT ON COLUMN "Users"."fu" IS \'Brazilian Federative Unity\'; COMMENT ON COLUMN "Users"."createdAt" IS \'User creation timestamp\'; COMMENT ON COLUMN "Users"."updatedAt" IS \'User updated timestamp\'; COMMENT ON COLUMN "Users"."deletedAt" IS \'User deleted timestamp\'; COMMENT ON COLUMN "Users"."deletedBy" IS \'Deleted by agentUser\'');
		await queryRunner.query('COMMENT ON TABLE "Users" IS \'Users data structure\'');
		await queryRunner.query('ALTER TABLE "UserPreferences" ADD CONSTRAINT "user_id" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "UserPreferences" DROP CONSTRAINT "user_id"');
		await queryRunner.query('COMMENT ON TABLE "Users" IS NULL');
		await queryRunner.query('DROP TABLE "Users"');
		await queryRunner.query('COMMENT ON TABLE "UserPreferences" IS NULL');
		await queryRunner.query('DROP TABLE "UserPreferences"');
	}
}
/* eslint-enable max-len */
