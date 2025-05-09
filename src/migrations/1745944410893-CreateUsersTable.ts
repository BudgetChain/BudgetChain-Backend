import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateUsersTable1745944410893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the enum types
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin');
      CREATE TYPE "public"."auth_provider_enum" AS ENUM('local', 'starknet');
    `);
    // Then create the users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying,
        "starknetWalletAddress" character varying,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
        "provider" "public"."auth_provider_enum" NOT NULL DEFAULT 'local',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the table first
    await queryRunner.query(`DROP TABLE "users"`);
    // Then drop the enum types
    await queryRunner.query(`
      DROP TYPE "public"."user_role_enum";
      DROP TYPE "public"."auth_provider_enum";
    `);
  }
}
