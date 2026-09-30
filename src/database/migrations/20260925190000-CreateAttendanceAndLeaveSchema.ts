import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendanceAndLeaveSchema20260925190000 implements MigrationInterface {
  name = 'CreateAttendanceAndLeaveSchema20260925190000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "attendance_status_enum" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'HOLIDAY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "leave_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "leave_category_enum" AS ENUM ('CASUAL', 'SICK', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "holiday_type_enum" AS ENUM ('NATIONAL', 'RELIGIOUS', 'SCHOOL_EVENT', 'VACATION', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create Student Attendance Table
    await queryRunner.query(`
      CREATE TABLE "student_attendance" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
        "class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
        "section_id" uuid NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
        "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "attendance_date" date NOT NULL,
        "status" "attendance_status_enum" NOT NULL DEFAULT 'PRESENT',
        "remarks" text,
        "marked_by" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_student_attendance_daily" UNIQUE ("school_id", "student_id", "attendance_date")
      );
    `);

    // 3. Create Staff Attendance Table
    await queryRunner.query(`
      CREATE TABLE "staff_attendance" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "staff_id" uuid NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
        "attendance_date" date NOT NULL,
        "status" "attendance_status_enum" NOT NULL DEFAULT 'PRESENT',
        "check_in_time" timestamptz,
        "check_out_time" timestamptz,
        "work_hours" numeric(4,2) DEFAULT 0,
        "is_late" boolean NOT NULL DEFAULT false,
        "is_half_day" boolean NOT NULL DEFAULT false,
        "remarks" text,
        "marked_by" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_staff_attendance_daily" UNIQUE ("school_id", "staff_id", "attendance_date")
      );
    `);

    // 4. Create Leave Types Table
    await queryRunner.query(`
      CREATE TABLE "leave_types" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "name" varchar(150) NOT NULL,
        "code" varchar(50) NOT NULL,
        "category" "leave_category_enum" NOT NULL DEFAULT 'CASUAL',
        "days_allowed_per_year" int NOT NULL DEFAULT 12,
        "is_paid" boolean NOT NULL DEFAULT true,
        "is_carry_forward" boolean NOT NULL DEFAULT false,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "uq_leave_type_code" UNIQUE ("school_id", "code")
      );
    `);

    // 5. Create Leave Requests Table
    await queryRunner.query(`
      CREATE TABLE "leave_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "applicant_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "staff_id" uuid REFERENCES "staff"("id") ON DELETE SET NULL,
        "student_id" uuid REFERENCES "students"("id") ON DELETE SET NULL,
        "leave_type_id" uuid NOT NULL REFERENCES "leave_types"("id") ON DELETE CASCADE,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "total_days" numeric(4,1) NOT NULL DEFAULT 1,
        "reason" text NOT NULL,
        "status" "leave_status_enum" NOT NULL DEFAULT 'PENDING',
        "document_url" text,
        "rejection_reason" text,
        "approved_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "approved_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 6. Create Holidays Table
    await queryRunner.query(`
      CREATE TABLE "holidays" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid REFERENCES "academic_years"("id") ON DELETE CASCADE,
        "title" varchar(200) NOT NULL,
        "holiday_type" "holiday_type_enum" NOT NULL DEFAULT 'NATIONAL',
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "total_days" int NOT NULL DEFAULT 1,
        "description" text,
        "is_recurring" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        "created_by" uuid,
        "updated_by" uuid
      );
    `);

    // 7. Create Indexes
    await queryRunner.query(`CREATE INDEX "idx_student_att_date_section" ON "student_attendance" ("school_id", "section_id", "attendance_date") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_staff_att_date" ON "staff_attendance" ("school_id", "attendance_date") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_leave_requests_user" ON "leave_requests" ("applicant_user_id", "status") WHERE "deleted_at" IS NULL;`);
    await queryRunner.query(`CREATE INDEX "idx_holidays_academic_year" ON "holidays" ("school_id", "start_date", "end_date") WHERE "deleted_at" IS NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "holidays" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "leave_requests" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "leave_types" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_attendance" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_attendance" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "holiday_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "leave_category_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "leave_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "attendance_status_enum";`);
  }
}
