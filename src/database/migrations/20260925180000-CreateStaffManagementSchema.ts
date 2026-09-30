import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffManagementSchema20260925180000 implements MigrationInterface {
  name = 'CreateStaffManagementSchema20260925180000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "employment_type_enum" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'VISITING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_status_enum" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "staff_document_type_enum" AS ENUM ('RESUME', 'CONTRACT', 'IDENTITY_PROOF', 'DEGREE_CERTIFICATE', 'EXPERIENCE_LETTER', 'BACKGROUND_CHECK', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create Departments Table
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "head_of_department_id" uuid,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_dept_school_code" UNIQUE ("school_id", "code")
      );
    `);

    // 3. Create Designations Table
    await queryRunner.query(`
      CREATE TABLE "designations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "department_id" uuid REFERENCES "departments"("id") ON DELETE SET NULL,
        "title" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" text,
        "level" int NOT NULL DEFAULT 1,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_desig_school_code" UNIQUE ("school_id", "code")
      );
    `);

    // 4. Create Staff Table
    await queryRunner.query(`
      CREATE TABLE "staff" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "employee_code" varchar(50) NOT NULL,
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "department_id" uuid REFERENCES "departments"("id") ON DELETE SET NULL,
        "designation_id" uuid REFERENCES "designations"("id") ON DELETE SET NULL,
        "first_name" varchar(100) NOT NULL,
        "middle_name" varchar(100),
        "last_name" varchar(100) NOT NULL,
        "email" varchar(150) NOT NULL,
        "phone" varchar(30) NOT NULL,
        "alternate_phone" varchar(30),
        "gender" varchar(20) NOT NULL,
        "date_of_birth" date NOT NULL,
        "date_of_joining" date NOT NULL DEFAULT CURRENT_DATE,
        "employment_type" "employment_type_enum" NOT NULL DEFAULT 'FULL_TIME',
        "qualification" varchar(200),
        "experience_years" numeric(4,1) DEFAULT 0,
        "marital_status" varchar(30),
        "blood_group" varchar(10),
        "emergency_contact_name" varchar(150),
        "emergency_contact_phone" varchar(30),
        "emergency_contact_relationship" varchar(50),
        "current_address" text,
        "permanent_address" text,
        "bank_account_title" varchar(150),
        "bank_name" varchar(150),
        "bank_account_number" varchar(50),
        "bank_ifsc_code" varchar(50),
        "pan_or_tax_id" varchar(50),
        "aadhaar_or_national_id" varchar(50),
        "basic_salary" numeric(12,2) DEFAULT 0,
        "status" "staff_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "photo_url" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_staff_school_code" UNIQUE ("school_id", "employee_code"),
        CONSTRAINT "uq_staff_school_email" UNIQUE ("school_id", "email")
      );
    `);

    // 5. Create Staff Documents Table
    await queryRunner.query(`
      CREATE TABLE "staff_documents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "staff_id" uuid NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
        "document_type" "staff_document_type_enum" NOT NULL DEFAULT 'OTHER',
        "document_name" varchar(200) NOT NULL,
        "document_number" varchar(100),
        "file_url" text NOT NULL,
        "file_name" varchar(255) NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "file_size" int NOT NULL DEFAULT 0,
        "issue_date" date,
        "expiry_date" date,
        "is_verified" boolean NOT NULL DEFAULT false,
        "verified_at" timestamptz,
        "verified_by" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 6. Create Indexes for High-Performance Queries
    await queryRunner.query(`CREATE INDEX "idx_departments_tenant_school" ON "departments" ("tenant_id", "school_id") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_designations_tenant_school" ON "designations" ("tenant_id", "school_id") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_staff_tenant_school_dept" ON "staff" ("tenant_id", "school_id", "department_id") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_staff_status" ON "staff" ("status") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_staff_docs_staff" ON "staff_documents" ("staff_id") WHERE "deleted_at" IS NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_documents" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "designations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "staff_document_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "staff_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employment_type_enum";`);
  }
}
