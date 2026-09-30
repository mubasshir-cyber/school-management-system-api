import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTreasuryIncomeExpenseSchema20260925220000 implements MigrationInterface {
  name = 'CreateTreasuryIncomeExpenseSchema20260925220000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "expense_status_enum" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "treasury_account_type_enum" AS ENUM ('BANK', 'CASH', 'PETTY_CASH', 'ONLINE_WALLET');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Treasury Accounts (Cash Registers / Bank Accounts)
    await queryRunner.query(`
      CREATE TABLE "treasury_accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "account_name" varchar(150) NOT NULL,
        "account_type" "treasury_account_type_enum" NOT NULL DEFAULT 'BANK',
        "account_number" varchar(50),
        "bank_name" varchar(150),
        "branch_name" varchar(150),
        "ifsc_code" varchar(50),
        "opening_balance" numeric(14,2) NOT NULL DEFAULT 0,
        "current_balance" numeric(14,2) NOT NULL DEFAULT 0,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 3. Income Categories Table
    await queryRunner.query(`
      CREATE TABLE "income_categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_income_category_code" UNIQUE ("school_id", "code")
      );
    `);

    // 4. Income Transactions Table
    await queryRunner.query(`
      CREATE TABLE "income_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "income_category_id" uuid NOT NULL REFERENCES "income_categories"("id") ON DELETE RESTRICT,
        "treasury_account_id" uuid REFERENCES "treasury_accounts"("id") ON DELETE SET NULL,
        "title" varchar(200) NOT NULL,
        "amount" numeric(14,2) NOT NULL DEFAULT 0,
        "transaction_date" date NOT NULL,
        "payment_method" varchar(50) NOT NULL DEFAULT 'BANK_TRANSFER',
        "reference_number" varchar(150),
        "payer_name" varchar(150),
        "receipt_number" varchar(100),
        "document_url" text,
        "notes" text,
        "received_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "status" varchar(20) NOT NULL DEFAULT 'RECEIVED',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 5. Expense Categories Table
    await queryRunner.query(`
      CREATE TABLE "expense_categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_expense_category_code" UNIQUE ("school_id", "code")
      );
    `);

    // 6. Expenses Table (with multi-status approval pipeline)
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "expense_category_id" uuid NOT NULL REFERENCES "expense_categories"("id") ON DELETE RESTRICT,
        "treasury_account_id" uuid REFERENCES "treasury_accounts"("id") ON DELETE SET NULL,
        "title" varchar(200) NOT NULL,
        "amount" numeric(14,2) NOT NULL DEFAULT 0,
        "expense_date" date NOT NULL,
        "payment_method" varchar(50) NOT NULL DEFAULT 'BANK_TRANSFER',
        "voucher_number" varchar(100) NOT NULL,
        "payee_name" varchar(150),
        "vendor_name" varchar(150),
        "invoice_number" varchar(100),
        "document_url" text,
        "status" "expense_status_enum" NOT NULL DEFAULT 'PENDING',
        "notes" text,
        "requested_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "approved_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "approved_at" timestamptz,
        "rejection_reason" text,
        "paid_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_expense_voucher_number" UNIQUE ("school_id", "voucher_number")
      );
    `);

    // 7. Indexes
    await queryRunner.query(`CREATE INDEX "idx_income_txn_date" ON "income_transactions" ("school_id", "transaction_date") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_expenses_date_status" ON "expenses" ("school_id", "expense_date", "status") WHERE "deleted_at" IS NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expense_categories" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "income_transactions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "income_categories" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "treasury_accounts" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "treasury_account_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "expense_status_enum";`);
  }
}
