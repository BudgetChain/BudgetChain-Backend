import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTreasuryTables1745528545970 implements MigrationInterface {
  name = 'CreateTreasuryTables1745528545970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "treasuries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "totalBalance" numeric(15,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6d41702e8cbb474881e821b378c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "treasuryId" uuid NOT NULL, "type" character varying NOT NULL, "value" numeric(15,2) NOT NULL, "currency" character varying NOT NULL, CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "treasuryId" uuid NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "amount" numeric(15,2) NOT NULL, "date" TIMESTAMP NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "budgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "treasuryId" uuid NOT NULL, "name" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "period" character varying NOT NULL, CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "allocations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "budgetId" uuid NOT NULL, "amount" numeric(15,2) NOT NULL, "purpose" character varying NOT NULL, CONSTRAINT "PK_ca63099fc248466264af0fa6f1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "risk_assessments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "treasuryId" uuid NOT NULL, "riskType" character varying NOT NULL, "score" integer NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_2717ff3f294d30390a712653d63" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityId" character varying NOT NULL, "entityType" character varying NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL, "timestamp" TIMESTAMP NOT NULL, "userId" character varying, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD CONSTRAINT "FK_a09d788cd984cb50991d649952c" FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_f8a9707542991e306efd2136100" FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "FK_cd2d755c5a776743865e6a44d8e" FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "allocations" ADD CONSTRAINT "FK_83bb937fa7818ba0238a6a3ad07" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risk_assessments" ADD CONSTRAINT "FK_e6e7202d6252d910087b71bfbbe" FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // Add indexes
    await queryRunner.query(
      `CREATE INDEX "idx_assets_treasuryId" ON "assets" ("treasuryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_treasuryId" ON "transactions" ("treasuryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_budgets_treasuryId" ON "budgets" ("treasuryId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_allocations_budgetId" ON "allocations" ("budgetId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_risk_assessments_treasuryId" ON "risk_assessments" ("treasuryId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_assets_treasuryId"`);
    await queryRunner.query(`DROP INDEX "idx_transactions_treasuryId"`);
    await queryRunner.query(`DROP INDEX "idx_budgets_treasuryId"`);
    await queryRunner.query(`DROP INDEX "idx_allocations_budgetId"`);
    await queryRunner.query(`DROP INDEX "idx_risk_assessments_treasuryId"`);
    await queryRunner.query(
      `ALTER TABLE "risk_assessments" DROP CONSTRAINT "FK_e6e7202d6252d910087b71bfbbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "allocations" DROP CONSTRAINT "FK_83bb937fa7818ba0238a6a3ad07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_cd2d755c5a776743865e6a44d8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_f8a9707542991e306efd2136100"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_a09d788cd984cb50991d649952c"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(`DROP TABLE "risk_assessments"`);
    await queryRunner.query(`DROP TABLE "allocations"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP TABLE "treasuries"`);
  }
}
