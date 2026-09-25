import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicManagementSchema20260925161000
  implements MigrationInterface
{
  name = 'CreateAcademicManagementSchema20260925161000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Subject Type Enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subject_type_enum" AS ENUM('CORE', 'ELECTIVE', 'LANGUAGE', 'PRACTICAL', 'ACTIVITY', 'SPORTS', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create Academic Years Table
    await queryRunner.query(`
      CREATE TABLE "academic_years" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_current" boolean NOT NULL DEFAULT false,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_academic_years_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_academic_years_school_code" UNIQUE ("school_id", "code"),
        CONSTRAINT "FK_academic_years_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_academic_years_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_academic_years_tenant_school" ON "academic_years" ("tenant_id", "school_id");
      CREATE INDEX "IDX_academic_years_is_current" ON "academic_years" ("school_id", "is_current");
    `);

    // 3. Create Classes Table
    await queryRunner.query(`
      CREATE TABLE "classes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "academic_year_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "level" integer NOT NULL DEFAULT 1,
        "display_order" integer NOT NULL DEFAULT 0,
        "capacity" integer NOT NULL DEFAULT 0,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_classes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_classes_year_code" UNIQUE ("school_id", "academic_year_id", "code"),
        CONSTRAINT "FK_classes_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_classes_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_classes_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_classes_tenant_school_year" ON "classes" ("tenant_id", "school_id", "academic_year_id");
    `);

    // 4. Create Sections Table
    await queryRunner.query(`
      CREATE TABLE "sections" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "name" character varying(50) NOT NULL,
        "code" character varying(50) NOT NULL,
        "capacity" integer NOT NULL DEFAULT 40,
        "room_number" character varying(50),
        "class_teacher_id" uuid,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_sections_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sections_class_code" UNIQUE ("class_id", "code"),
        CONSTRAINT "FK_sections_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sections_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sections_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sections_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sections_class_teacher" FOREIGN KEY ("class_teacher_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
      CREATE INDEX "IDX_sections_tenant_school_class" ON "sections" ("tenant_id", "school_id", "class_id");
    `);

    // 5. Create Subjects Table
    await queryRunner.query(`
      CREATE TABLE "subjects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "code" character varying(50) NOT NULL,
        "type" "public"."subject_type_enum" NOT NULL DEFAULT 'CORE',
        "theory_max_marks" numeric(5,2) NOT NULL DEFAULT 100,
        "practical_max_marks" numeric(5,2) NOT NULL DEFAULT 0,
        "passing_marks" numeric(5,2) NOT NULL DEFAULT 35,
        "is_grade_based" boolean NOT NULL DEFAULT false,
        "credit" numeric(4,2) NOT NULL DEFAULT 1.0,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_subjects_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_subjects_school_code" UNIQUE ("school_id", "code"),
        CONSTRAINT "FK_subjects_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_subjects_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_subjects_tenant_school" ON "subjects" ("tenant_id", "school_id");
    `);

    // 6. Create Class Subjects Table
    await queryRunner.query(`
      CREATE TABLE "class_subjects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "academic_year_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "subject_id" uuid NOT NULL,
        "is_mandatory" boolean NOT NULL DEFAULT true,
        "display_order" integer NOT NULL DEFAULT 0,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_class_subjects_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_class_subjects_class_subject" UNIQUE ("class_id", "subject_id"),
        CONSTRAINT "FK_class_subjects_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_class_subjects_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_class_subjects_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_class_subjects_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_class_subjects_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_class_subjects_class_id" ON "class_subjects" ("class_id");
    `);

    // 7. Create Teacher Class Assignments Table
    await queryRunner.query(`
      CREATE TABLE "teacher_class_assignments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid NOT NULL,
        "teacher_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "section_id" uuid NOT NULL,
        "is_class_teacher" boolean NOT NULL DEFAULT false,
        "start_date" date,
        "end_date" date,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teacher_class_assignments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_teacher_class_assignment" UNIQUE ("academic_year_id", "section_id", "teacher_id"),
        CONSTRAINT "FK_tca_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tca_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tca_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tca_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tca_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tca_section" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_tca_teacher_id" ON "teacher_class_assignments" ("teacher_id");
      CREATE INDEX "IDX_tca_section_id" ON "teacher_class_assignments" ("section_id");
    `);

    // 8. Create Teacher Subject Assignments Table
    await queryRunner.query(`
      CREATE TABLE "teacher_subject_assignments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "academic_year_id" uuid NOT NULL,
        "teacher_id" uuid NOT NULL,
        "class_id" uuid NOT NULL,
        "section_id" uuid NOT NULL,
        "subject_id" uuid NOT NULL,
        "start_date" date,
        "end_date" date,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teacher_subject_assignments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_teacher_subject_assignment" UNIQUE ("academic_year_id", "section_id", "subject_id", "teacher_id"),
        CONSTRAINT "FK_tsa_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tsa_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tsa_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tsa_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tsa_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tsa_section" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tsa_subject" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_tsa_teacher_subject" ON "teacher_subject_assignments" ("teacher_id", "subject_id");
      CREATE INDEX "IDX_tsa_section_subject" ON "teacher_subject_assignments" ("section_id", "subject_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "teacher_subject_assignments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teacher_class_assignments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "class_subjects" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subjects" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sections" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "classes" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "academic_years" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."subject_type_enum";`);
  }
}
