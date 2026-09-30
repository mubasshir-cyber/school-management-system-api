import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentManagementSchema20260925170000
  implements MigrationInterface
{
  name = 'CreateStudentManagementSchema20260925170000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."student_status_enum" AS ENUM(
          'REGISTERED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED', 'ALUMNI'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."guardian_relationship_enum" AS ENUM(
          'FATHER', 'MOTHER', 'LEGAL_GUARDIAN', 'GRANDPARENT', 'SIBLING', 'OTHER'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."student_document_type_enum" AS ENUM(
          'BIRTH_CERTIFICATE', 'GOVERNMENT_ID', 'TRANSFER_CERTIFICATE', 'PREVIOUS_MARKSHEET', 'MEDICAL_CERTIFICATE', 'ADDRESS_PROOF', 'PASSPORT_PHOTO', 'OTHER'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."admission_status_enum" AS ENUM(
          'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ENROLLED', 'CANCELLED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."enrollment_status_enum" AS ENUM(
          'ACTIVE', 'TRANSFERRED', 'PROMOTED', 'WITHDRAWN', 'SUSPENDED', 'GRADUATED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."sequence_type_enum" AS ENUM(
          'STUDENT', 'ADMISSION', 'EMPLOYEE', 'RECEIPT', 'EXPENSE'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Numbering Sequences Table (Collision-safe sequence generator)
    await queryRunner.query(`
      CREATE TABLE "numbering_sequences" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "sequence_type" "public"."sequence_type_enum" NOT NULL,
        "prefix" character varying(20) NOT NULL DEFAULT '',
        "current_year" integer NOT NULL,
        "last_number" integer NOT NULL DEFAULT 0,
        "format" character varying(50) NOT NULL DEFAULT '{PREFIX}-{YEAR}-{SEQ:6}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_numbering_sequences_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_numbering_sequences_school_type_year" UNIQUE ("school_id", "sequence_type", "current_year"),
        CONSTRAINT "FK_numbering_sequences_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_numbering_sequences_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_numbering_sequences_school_type" ON "numbering_sequences" ("school_id", "sequence_type");
    `);

    // 3. Students Table (Master Identity)
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "student_code" character varying(50) NOT NULL,
        "admission_number" character varying(50),
        "first_name" character varying(100) NOT NULL,
        "middle_name" character varying(100),
        "last_name" character varying(100) NOT NULL,
        "date_of_birth" date NOT NULL,
        "gender" character varying(20) NOT NULL,
        "blood_group" character varying(10),
        "nationality" character varying(50) DEFAULT 'Indian',
        "category" character varying(50) DEFAULT 'General',
        "government_id_type" character varying(50),
        "government_id_number" character varying(50),
        "mobile" character varying(20),
        "email" character varying(150),
        "address_line_1" character varying(255),
        "address_line_2" character varying(255),
        "city" character varying(100),
        "state" character varying(100),
        "country" character varying(100) DEFAULT 'India',
        "postal_code" character varying(20),
        "photo_url" character varying(500),
        "status" "public"."student_status_enum" NOT NULL DEFAULT 'REGISTERED',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_students_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_students_school_student_code" UNIQUE ("school_id", "student_code"),
        CONSTRAINT "FK_students_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_students_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_students_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT
      );
      CREATE INDEX "IDX_students_tenant_school_branch" ON "students" ("tenant_id", "school_id", "branch_id");
      CREATE INDEX "IDX_students_name" ON "students" ("first_name", "last_name");
      CREATE INDEX "IDX_students_status" ON "students" ("school_id", "status");
      CREATE INDEX "IDX_students_admission_number" ON "students" ("school_id", "admission_number");
    `);

    // 4. Guardians Table (Master Guardian Identity)
    await queryRunner.query(`
      CREATE TABLE "guardians" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "middle_name" character varying(100),
        "last_name" character varying(100) NOT NULL,
        "relationship_type" "public"."guardian_relationship_enum" NOT NULL DEFAULT 'FATHER',
        "mobile" character varying(20) NOT NULL,
        "alternate_mobile" character varying(20),
        "email" character varying(150),
        "occupation" character varying(100),
        "employer" character varying(150),
        "annual_income" numeric(12,2),
        "government_id_type" character varying(50),
        "government_id_number" character varying(50),
        "address_line_1" character varying(255),
        "address_line_2" character varying(255),
        "city" character varying(100),
        "state" character varying(100),
        "country" character varying(100) DEFAULT 'India',
        "postal_code" character varying(20),
        "photo_url" character varying(500),
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_guardians_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_guardians_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_guardians_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_guardians_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT
      );
      CREATE INDEX "IDX_guardians_tenant_school" ON "guardians" ("tenant_id", "school_id");
      CREATE INDEX "IDX_guardians_mobile" ON "guardians" ("school_id", "mobile");
      CREATE INDEX "IDX_guardians_name" ON "guardians" ("first_name", "last_name");
    `);

    // 5. Student Guardians Junction Table
    await queryRunner.query(`
      CREATE TABLE "student_guardians" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "guardian_id" uuid NOT NULL,
        "relationship_type" "public"."guardian_relationship_enum" NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT false,
        "is_emergency_contact" boolean NOT NULL DEFAULT false,
        "can_pickup_student" boolean NOT NULL DEFAULT false,
        "receives_notifications" boolean NOT NULL DEFAULT true,
        "has_portal_access" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_guardians_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_student_guardians_student_guardian" UNIQUE ("student_id", "guardian_id"),
        CONSTRAINT "FK_student_guardians_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_guardians_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_guardians_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_guardians_guardian" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_student_guardians_student" ON "student_guardians" ("student_id");
      CREATE INDEX "IDX_student_guardians_guardian" ON "student_guardians" ("guardian_id");
    `);

    // 6. Admissions Table
    await queryRunner.query(`
      CREATE TABLE "admissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "application_number" character varying(50) NOT NULL,
        "student_id" uuid,
        "academic_year_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "preferred_section_id" uuid,
        "application_date" date NOT NULL DEFAULT CURRENT_DATE,
        "status" "public"."admission_status_enum" NOT NULL DEFAULT 'DRAFT',
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "date_of_birth" date NOT NULL,
        "gender" character varying(20) NOT NULL,
        "guardian_name" character varying(100) NOT NULL,
        "guardian_mobile" character varying(20) NOT NULL,
        "guardian_email" character varying(150),
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP WITH TIME ZONE,
        "approved_by" uuid,
        "approved_at" TIMESTAMP WITH TIME ZONE,
        "rejected_by" uuid,
        "rejected_at" TIMESTAMP WITH TIME ZONE,
        "rejection_reason" text,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_admissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admissions_school_application_number" UNIQUE ("school_id", "application_number"),
        CONSTRAINT "FK_admissions_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_admissions_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_admissions_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_admissions_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_admissions_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_admissions_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_admissions_section" FOREIGN KEY ("preferred_section_id") REFERENCES "sections"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_admissions_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_admissions_approved_by" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_admissions_rejected_by" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL
      );
      CREATE INDEX "IDX_admissions_tenant_school" ON "admissions" ("tenant_id", "school_id");
      CREATE INDEX "IDX_admissions_status" ON "admissions" ("school_id", "status");
      CREATE INDEX "IDX_admissions_academic_year" ON "admissions" ("academic_year_id", "class_id");
    `);

    // 7. Student Enrollments Table
    await queryRunner.query(`
      CREATE TABLE "student_enrollments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "academic_year_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "section_id" uuid NOT NULL,
        "roll_number" character varying(50),
        "enrollment_date" date NOT NULL DEFAULT CURRENT_DATE,
        "status" "public"."enrollment_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "promotion_status" character varying(50),
        "start_date" date NOT NULL DEFAULT CURRENT_DATE,
        "end_date" date,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_student_enrollments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_enrollments_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_enrollments_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_enrollments_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_student_enrollments_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_enrollments_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_student_enrollments_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_student_enrollments_section" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT
      );
      CREATE INDEX "IDX_student_enrollments_student" ON "student_enrollments" ("student_id");
      CREATE INDEX "IDX_student_enrollments_year_class_section" ON "student_enrollments" ("academic_year_id", "class_id", "section_id");
      CREATE INDEX "IDX_student_enrollments_status" ON "student_enrollments" ("school_id", "status");
    `);

    // 8. Student Documents Table
    await queryRunner.query(`
      CREATE TABLE "student_documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "document_type" "public"."student_document_type_enum" NOT NULL,
        "document_name" character varying(150) NOT NULL,
        "document_number" character varying(100),
        "file_url" character varying(500) NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "mime_type" character varying(100) NOT NULL,
        "file_size" integer NOT NULL,
        "issue_date" date,
        "expiry_date" date,
        "is_verified" boolean NOT NULL DEFAULT false,
        "verified_by" uuid,
        "verified_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_student_documents_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_documents_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_documents_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_documents_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_student_documents_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_documents_verified_by" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL
      );
      CREATE INDEX "IDX_student_documents_student" ON "student_documents" ("student_id");
      CREATE INDEX "IDX_student_documents_type" ON "student_documents" ("student_id", "document_type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_documents" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_enrollments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_guardians" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "guardians" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "students" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "numbering_sequences" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sequence_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."enrollment_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."admission_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."student_document_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."guardian_relationship_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."student_status_enum";`);
  }
}
