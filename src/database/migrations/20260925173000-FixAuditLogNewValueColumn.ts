import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAuditLogNewValueColumn20260925173000 implements MigrationInterface {
  name = 'FixAuditLogNewValueColumn20260925173000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'audit_logs' AND column_name = 'newValue'
        ) THEN
          ALTER TABLE "audit_logs" RENAME COLUMN "newValue" TO "new_value";
        ELSIF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'audit_logs' AND column_name = 'new_value'
        ) THEN
          ALTER TABLE "audit_logs" ADD COLUMN "new_value" jsonb;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'audit_logs' AND column_name = 'new_value'
        ) THEN
          ALTER TABLE "audit_logs" RENAME COLUMN "new_value" TO "newValue";
        END IF;
      END $$;
    `);
  }
}
