import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTreasuryTables1745568487893 implements MigrationInterface {
  name = 'CreateTreasuryTables1745568487893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create treasuries first (due to foreign key dependencies)
    await queryRunner.query(`
            CREATE TABLE "treasuries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "totalBalance" numeric(15,2) NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_treasuries" PRIMARY KEY ("id")
            )
        `);

    // Create assets
    await queryRunner.query(`
            CREATE TABLE "assets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "treasuryId" uuid NOT NULL,
                "type" character varying(50) NOT NULL,
                "value" numeric(15,2) NOT NULL,
                "currency" character varying(3) NOT NULL,
                CONSTRAINT "PK_assets" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "idx_assets_treasuryId" ON "assets" ("treasuryId")`,
    );

    // Create transactions
    await queryRunner.query(`
            CREATE TYPE "public"."transactions_type_enum" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')
        `);
    await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "treasuryId" uuid NOT NULL,
                "type" "public"."transactions_type_enum" NOT NULL,
                "amount" numeric(15,2) NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING',
                CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_treasuryId" ON "transactions" ("treasuryId")`,
    );

    // Create budgets
    await queryRunner.query(`
            CREATE TABLE "budgets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "treasuryId" uuid NOT NULL,
                "name" character varying(100) NOT NULL,
                "amount" numeric(15,2) NOT NULL,
                "period" character varying(50) NOT NULL,
                CONSTRAINT "PK_budgets" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "idx_budgets_treasuryId" ON "budgets" ("treasuryId")`,
    );

    // Create allocations
    await queryRunner.query(`
            CREATE TABLE "allocations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "budgetId" uuid NOT NULL,
                "amount" numeric(15,2) NOT NULL,
                "purpose" character varying(200) NOT NULL,
                CONSTRAINT "PK_allocations" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "idx_allocations_budgetId" ON "allocations" ("budgetId")`,
    );

    // Create risk_assessments
    await queryRunner.query(`
            CREATE TABLE "risk_assessments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "treasuryId" uuid NOT NULL,
                "riskType" character varying(50) NOT NULL,
                "score" integer NOT NULL,
                "description" text NOT NULL,
                CONSTRAINT "PK_risk_assessments" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "idx_risk_assessments_treasuryId" ON "risk_assessments" ("treasuryId")`,
    );

    // Create audit_logs
    await queryRunner.query(`
            CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE')
        `);
    await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "entityId" character varying NOT NULL,
                "entityType" character varying(50) NOT NULL,
                "action" "public"."audit_logs_action_enum" NOT NULL,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" character varying,
                CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
            )
        `);

    // Add foreign keys
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_assets_treasuryId"
            FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_transactions_treasuryId"
            FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "budgets"
            ADD CONSTRAINT "FK_budgets_treasuryId"
            FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "allocations"
            ADD CONSTRAINT "FK_allocations_budgetId"
            FOREIGN KEY ("budgetId") REFERENCES "budgets"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "risk_assessments"
            ADD CONSTRAINT "FK_risk_assessments_treasuryId"
            FOREIGN KEY ("treasuryId") REFERENCES "treasuries"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "risk_assessments" DROP CONSTRAINT "FK_risk_assessments_treasuryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "allocations" DROP CONSTRAINT "FK_allocations_budgetId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_budgets_treasuryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_treasuryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_assets_treasuryId"`,
    );

    // Drop tables and indexes
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(`DROP TABLE "risk_assessments"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_risk_assessments_treasuryId"`,
    );
    await queryRunner.query(`DROP TABLE "allocations"`);
    await queryRunner.query(`DROP INDEX "public"."idx_allocations_budgetId"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(`DROP INDEX "public"."idx_budgets_treasuryId"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP INDEX "public"."idx_assets_treasuryId"`);
    await queryRunner.query(`DROP TABLE "treasuries"`);
  }
}
