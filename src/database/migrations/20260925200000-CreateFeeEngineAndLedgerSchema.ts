import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeeEngineAndLedgerSchema20260925200000 implements MigrationInterface {
  name = 'CreateFeeEngineAndLedgerSchema20260925200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fee_frequency_enum" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'TERM', 'ANNUAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fee_invoice_status_enum" AS ENUM ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fee_payment_method_enum" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fee_payment_status_enum" AS ENUM ('SUCCESS', 'PENDING', 'BOUNCED', 'REVERSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fee_ledger_entry_enum" AS ENUM ('DEBIT', 'CREDIT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fee_ledger_category_enum" AS ENUM ('INVOICE', 'PAYMENT', 'DISCOUNT', 'WAIVER', 'FINE', 'REFUND', 'ADJUSTMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Fee Types Table (Fee Heads)
    await queryRunner.query(`
      CREATE TABLE "fee_types" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "is_optional" boolean NOT NULL DEFAULT false,
        "account_code" varchar(50),
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_fee_type_code" UNIQUE ("school_id", "code")
      );
    `);

    // 3. Fee Structures Table
    await queryRunner.query(`
      CREATE TABLE "fee_structures" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
        "class_id" uuid REFERENCES "classes"("id") ON DELETE SET NULL,
        "name" varchar(200) NOT NULL,
        "code" varchar(50) NOT NULL,
        "frequency" "fee_frequency_enum" NOT NULL DEFAULT 'MONTHLY',
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_fee_structure_code" UNIQUE ("school_id", "code")
      );
    `);

    // 4. Fee Structure Items Table
    await queryRunner.query(`
      CREATE TABLE "fee_structure_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "fee_structure_id" uuid NOT NULL REFERENCES "fee_structures"("id") ON DELETE CASCADE,
        "fee_type_id" uuid NOT NULL REFERENCES "fee_types"("id") ON DELETE RESTRICT,
        "amount" numeric(12,2) NOT NULL DEFAULT 0,
        "due_day_of_month" int DEFAULT 10,
        "late_fine_amount" numeric(10,2) DEFAULT 0,
        "grace_days" int DEFAULT 5,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 5. Fee Discounts Table (Scholarships / Concessions)
    await queryRunner.query(`
      CREATE TABLE "fee_discounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "discount_type" varchar(20) NOT NULL DEFAULT 'PERCENTAGE',
        "value" numeric(10,2) NOT NULL DEFAULT 0,
        "reason" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_fee_discount_code" UNIQUE ("school_id", "code")
      );
    `);

    // 6. Student Fee Assignments Table
    await queryRunner.query(`
      CREATE TABLE "student_fee_assignments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
        "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "fee_structure_id" uuid NOT NULL REFERENCES "fee_structures"("id") ON DELETE RESTRICT,
        "fee_discount_id" uuid REFERENCES "fee_discounts"("id") ON DELETE SET NULL,
        "custom_discount_amount" numeric(10,2) DEFAULT 0,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_student_fee_assignment" UNIQUE ("school_id", "academic_year_id", "student_id", "fee_structure_id")
      );
    `);

    // 7. Fee Invoices Table
    await queryRunner.query(`
      CREATE TABLE "fee_invoices" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
        "invoice_number" varchar(100) NOT NULL,
        "title" varchar(200) NOT NULL,
        "invoice_date" date NOT NULL,
        "due_date" date NOT NULL,
        "subtotal" numeric(12,2) NOT NULL DEFAULT 0,
        "discount_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "fine_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "paid_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "balance_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "status" "fee_invoice_status_enum" NOT NULL DEFAULT 'UNPAID',
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_fee_invoice_number" UNIQUE ("school_id", "invoice_number")
      );
    `);

    // 8. Fee Invoice Items Table
    await queryRunner.query(`
      CREATE TABLE "fee_invoice_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "fee_invoice_id" uuid NOT NULL REFERENCES "fee_invoices"("id") ON DELETE CASCADE,
        "fee_type_id" uuid NOT NULL REFERENCES "fee_types"("id") ON DELETE RESTRICT,
        "amount" numeric(12,2) NOT NULL DEFAULT 0,
        "discount_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "net_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 9. Fee Payments Table
    await queryRunner.query(`
      CREATE TABLE "fee_payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "fee_invoice_id" uuid REFERENCES "fee_invoices"("id") ON DELETE SET NULL,
        "receipt_number" varchar(100) NOT NULL,
        "payment_date" date NOT NULL,
        "amount" numeric(12,2) NOT NULL DEFAULT 0,
        "payment_method" "fee_payment_method_enum" NOT NULL DEFAULT 'CASH',
        "transaction_reference" varchar(150),
        "cheque_number" varchar(100),
        "bank_name" varchar(150),
        "status" "fee_payment_status_enum" NOT NULL DEFAULT 'SUCCESS',
        "remarks" text,
        "received_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_fee_payment_receipt" UNIQUE ("school_id", "receipt_number")
      );
    `);

    // 10. Fee Ledgers Table (Double-Entry Student Ledger)
    await queryRunner.query(`
      CREATE TABLE "fee_ledgers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
        "transaction_date" timestamptz NOT NULL DEFAULT now(),
        "entry_type" "fee_ledger_entry_enum" NOT NULL,
        "category" "fee_ledger_category_enum" NOT NULL,
        "fee_type_id" uuid REFERENCES "fee_types"("id") ON DELETE SET NULL,
        "fee_invoice_id" uuid REFERENCES "fee_invoices"("id") ON DELETE SET NULL,
        "fee_payment_id" uuid REFERENCES "fee_payments"("id") ON DELETE SET NULL,
        "amount" numeric(12,2) NOT NULL DEFAULT 0,
        "balance_after" numeric(12,2) NOT NULL DEFAULT 0,
        "reference_number" varchar(100),
        "description" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 11. Create Indexes
    await queryRunner.query(`CREATE INDEX "idx_fee_invoices_student" ON "fee_invoices" ("student_id", "status") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_fee_payments_student" ON "fee_payments" ("student_id", "payment_date") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_fee_ledgers_student" ON "fee_ledgers" ("student_id", "transaction_date") WHERE "deleted_at" IS NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_ledgers" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_invoice_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_invoices" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_fee_assignments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_discounts" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_structure_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_structures" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_types" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_ledger_category_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_ledger_entry_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_payment_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_payment_method_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_invoice_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fee_frequency_enum";`);
  }
}
