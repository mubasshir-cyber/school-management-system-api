import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayrollAndSalarySchema20260925210000 implements MigrationInterface {
  name = 'CreatePayrollAndSalarySchema20260925210000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "salary_component_type_enum" AS ENUM ('EARNING', 'DEDUCTION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "salary_calc_type_enum" AS ENUM ('FIXED', 'PERCENTAGE_OF_BASIC');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payroll_status_enum" AS ENUM ('DRAFT', 'CALCULATED', 'REVIEW', 'APPROVED', 'PAID', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Salary Components Table
    await queryRunner.query(`
      CREATE TABLE "salary_components" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "component_type" "salary_component_type_enum" NOT NULL DEFAULT 'EARNING',
        "calculation_type" "salary_calc_type_enum" NOT NULL DEFAULT 'FIXED',
        "default_value" numeric(12,2) NOT NULL DEFAULT 0,
        "is_taxable" boolean NOT NULL DEFAULT true,
        "is_statutory" boolean NOT NULL DEFAULT false,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_salary_component_code" UNIQUE ("school_id", "code")
      );
    `);

    // 3. Salary Structures Table
    await queryRunner.query(`
      CREATE TABLE "salary_structures" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(200) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_salary_structure_code" UNIQUE ("school_id", "code")
      );
    `);

    // 4. Salary Structure Items Table
    await queryRunner.query(`
      CREATE TABLE "salary_structure_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "salary_structure_id" uuid NOT NULL REFERENCES "salary_structures"("id") ON DELETE CASCADE,
        "salary_component_id" uuid NOT NULL REFERENCES "salary_components"("id") ON DELETE RESTRICT,
        "calculation_type" "salary_calc_type_enum" NOT NULL DEFAULT 'FIXED',
        "value" numeric(12,2) NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 5. Staff Salary Assignments Table
    await queryRunner.query(`
      CREATE TABLE "staff_salary_assignments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "staff_id" uuid NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
        "salary_structure_id" uuid NOT NULL REFERENCES "salary_structures"("id") ON DELETE RESTRICT,
        "base_gross_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "bank_name" varchar(150),
        "bank_account_number" varchar(50),
        "ifsc_code" varchar(50),
        "pan_number" varchar(50),
        "effective_from" date NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_staff_salary_assignment" UNIQUE ("school_id", "staff_id")
      );
    `);

    // 6. Payrolls Table (Monthly Payroll Batch)
    await queryRunner.query(`
      CREATE TABLE "payrolls" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid REFERENCES "academic_years"("id") ON DELETE SET NULL,
        "month" int NOT NULL,
        "year" int NOT NULL,
        "payroll_title" varchar(200) NOT NULL,
        "total_staff_count" int NOT NULL DEFAULT 0,
        "total_gross_amount" numeric(14,2) NOT NULL DEFAULT 0,
        "total_deductions_amount" numeric(14,2) NOT NULL DEFAULT 0,
        "total_net_amount" numeric(14,2) NOT NULL DEFAULT 0,
        "status" "payroll_status_enum" NOT NULL DEFAULT 'DRAFT',
        "processed_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "approved_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "paid_at" timestamptz,
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_monthly_payroll" UNIQUE ("school_id", "month", "year")
      );
    `);

    // 7. Payroll Items Table (Individual Payslips)
    await queryRunner.query(`
      CREATE TABLE "payroll_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "payroll_id" uuid NOT NULL REFERENCES "payrolls"("id") ON DELETE CASCADE,
        "staff_id" uuid NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
        "basic_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "total_earnings" numeric(12,2) NOT NULL DEFAULT 0,
        "total_deductions" numeric(12,2) NOT NULL DEFAULT 0,
        "unpaid_leaves_count" numeric(4,1) NOT NULL DEFAULT 0,
        "lop_deduction_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "net_salary" numeric(12,2) NOT NULL DEFAULT 0,
        "breakdown" jsonb,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "remarks" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_payroll_item_staff" UNIQUE ("payroll_id", "staff_id")
      );
    `);

    // 8. Salary Payments Table
    await queryRunner.query(`
      CREATE TABLE "salary_payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "payroll_item_id" uuid NOT NULL REFERENCES "payroll_items"("id") ON DELETE CASCADE,
        "payment_date" date NOT NULL,
        "amount" numeric(12,2) NOT NULL DEFAULT 0,
        "payment_method" varchar(50) NOT NULL DEFAULT 'BANK_TRANSFER',
        "transaction_reference" varchar(150),
        "status" varchar(20) NOT NULL DEFAULT 'PAID',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 9. Indexes
    await queryRunner.query(`CREATE INDEX "idx_payrolls_month_year" ON "payrolls" ("school_id", "year", "month") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_payroll_items_staff" ON "payroll_items" ("staff_id", "status") WHERE "deleted_at" IS NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payroll_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payrolls" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_salary_assignments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_structure_items" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_structures" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_components" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payroll_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "salary_calc_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "salary_component_type_enum";`);
  }
}
