import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePhase1InitialSchema1727260000000
  implements MigrationInterface
{
  name = 'CreatePhase1InitialSchema1727260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable pgcrypto for gen_random_uuid()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Create Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."common_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED', 'SUSPENDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."data_scope_enum" AS ENUM('ORGANIZATION', 'BRANCH', 'DEPARTMENT', 'CLASS', 'SECTION', 'TEAM', 'SELF');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."user_type_enum" AS ENUM('ADMIN', 'STAFF', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Create Tenants Table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "code" character varying(50) NOT NULL,
        "domain" character varying(255),
        "contact_email" character varying(255) NOT NULL,
        "contact_phone" character varying(50),
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "subscription_plan" character varying(100) NOT NULL DEFAULT 'ENTERPRISE',
        "max_schools" integer NOT NULL DEFAULT 10,
        "max_students" integer NOT NULL DEFAULT 10000,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_tenants_code" UNIQUE ("code"),
        CONSTRAINT "UQ_tenants_domain" UNIQUE ("domain"),
        CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id")
      );
    `);

    // 4. Create Schools Table
    await queryRunner.query(`
      CREATE TABLE "schools" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "code" character varying(50) NOT NULL,
        "registration_number" character varying(100),
        "board" character varying(100),
        "medium" character varying(100) NOT NULL DEFAULT 'English',
        "school_type" character varying(100) NOT NULL DEFAULT 'Co-Educational',
        "address" text,
        "city" character varying(100),
        "state" character varying(100),
        "country" character varying(100) NOT NULL DEFAULT 'India',
        "pincode" character varying(20),
        "phone" character varying(50),
        "email" character varying(255),
        "website" character varying(255),
        "logo_url" character varying(500),
        "principal_name" character varying(255),
        "established_date" date,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_schools_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schools_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_schools_tenant_id" ON "schools" ("tenant_id");
    `);

    // 5. Create Branches Table
    await queryRunner.query(`
      CREATE TABLE "branches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "code" character varying(50) NOT NULL,
        "address" text,
        "city" character varying(100),
        "phone" character varying(50),
        "email" character varying(255),
        "branch_head" character varying(255),
        "is_main_branch" boolean NOT NULL DEFAULT false,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_branches_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_branches_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_branches_school_id" ON "branches" ("school_id");
    `);

    // 6. Create School Settings Table
    await queryRunner.query(`
      CREATE TABLE "school_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "category" character varying(100) NOT NULL,
        "setting_key" character varying(100) NOT NULL,
        "setting_value" jsonb NOT NULL,
        "description" text,
        "is_encrypted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_school_settings_key" UNIQUE ("school_id", "setting_key"),
        CONSTRAINT "PK_school_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_school_settings_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      );
    `);

    // 7. Create Permissions Table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(150) NOT NULL,
        "module" character varying(100) NOT NULL,
        "resource" character varying(100) NOT NULL,
        "action" character varying(50) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "is_system" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permissions_code" UNIQUE ("code"),
        CONSTRAINT "UQ_permissions_mra" UNIQUE ("module", "resource", "action"),
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
      );
    `);

    // 8. Create Roles Table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid,
        "school_id" uuid,
        "name" character varying(100) NOT NULL,
        "code" character varying(100) NOT NULL,
        "description" text,
        "default_scope" "public"."data_scope_enum" NOT NULL DEFAULT 'ORGANIZATION',
        "is_system" boolean NOT NULL DEFAULT false,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      );
    `);

    // 9. Create Role Permissions Table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        "scope_override" "public"."data_scope_enum",
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_role_permissions" UNIQUE ("role_id", "permission_id"),
        CONSTRAINT "PK_role_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      );
    `);

    // 10. Create Users Table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "branch_id" uuid,
        "email" character varying(255) NOT NULL,
        "phone" character varying(50),
        "password_hash" character varying(255) NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100),
        "user_type" "public"."user_type_enum" NOT NULL DEFAULT 'STAFF',
        "staff_id" uuid,
        "student_id" uuid,
        "guardian_id" uuid,
        "status" "public"."common_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "avatar_url" character varying(500),
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "is_phone_verified" boolean NOT NULL DEFAULT false,
        "failed_login_attempts" integer NOT NULL DEFAULT 0,
        "locked_until" TIMESTAMP WITH TIME ZONE,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        "last_login_ip" character varying(50),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );
      CREATE INDEX "IDX_users_email_tenant" ON "users" ("email", "tenant_id");
    `);

    // 11. Create User Roles Table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        "custom_scope" "public"."data_scope_enum",
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_roles" UNIQUE ("user_id", "role_id"),
        CONSTRAINT "PK_user_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
      );
    `);

    // 12. Create User Sessions Table
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "ip_address" character varying(50),
        "user_agent" character varying(500),
        "device" character varying(100),
        "is_active" boolean NOT NULL DEFAULT true,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // 13. Create Refresh Tokens Table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "ip_address" character varying(50),
        "user_agent" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
      CREATE INDEX "IDX_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash");
    `);

    // 14. Create Audit Logs Table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid,
        "school_id" uuid,
        "branch_id" uuid,
        "user_id" uuid,
        "user_email" character varying(255),
        "action" character varying(50) NOT NULL,
        "module" character varying(100) NOT NULL,
        "entity" character varying(100) NOT NULL,
        "entity_id" character varying(100),
        "old_value" jsonb,
        "newValue" jsonb,
        "ip_address" character varying(50),
        "user_agent" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      );
      CREATE INDEX "IDX_audit_logs_tenant_id" ON "audit_logs" ("tenant_id");
      CREATE INDEX "IDX_audit_logs_school_id" ON "audit_logs" ("school_id");
      CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id");
      CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action");
      CREATE INDEX "IDX_audit_logs_module" ON "audit_logs" ("module");
      CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_settings" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branches" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schools" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."data_scope_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."common_status_enum";`);
  }
}
