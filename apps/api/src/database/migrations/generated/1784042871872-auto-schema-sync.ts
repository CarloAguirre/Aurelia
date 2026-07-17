import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoSchemaSync1784042871872 implements MigrationInterface {
  name = 'AutoSchemaSync1784042871872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"detected_condition\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"proposed_corrective_action\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"executed_action_description\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"rejection_reason\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"executed_at\" TIMESTAMP WITH TIME ZONE");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"executed_by_user_id\" uuid");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"rejected_at\" TIMESTAMP WITH TIME ZONE");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD COLUMN IF NOT EXISTS \"rejected_by_user_id\" uuid");

    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
            AND t.typname = 'inspection_finding_status'
        ) THEN
          CREATE TYPE \"public\".\"inspection_finding_status\" AS ENUM('open', 'in_progress', 'closed', 'rejected', 'cancelled');
        END IF;
      END
      $$`,
    );

    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" TYPE \"public\".\"inspection_finding_status\" USING \"status\"::\"text\"::\"public\".\"inspection_finding_status\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" SET DEFAULT 'open'");
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_if_executed_by'
        ) THEN
          ALTER TABLE "inspection_findings"
          ADD CONSTRAINT "fk_if_executed_by"
          FOREIGN KEY ("executed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END
      $$`,
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_if_rejected_by'
        ) THEN
          ALTER TABLE "inspection_findings"
          ADD CONSTRAINT "fk_if_rejected_by"
          FOREIGN KEY ("rejected_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END
      $$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP CONSTRAINT IF EXISTS \"fk_if_executed_by\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP CONSTRAINT IF EXISTS \"fk_if_rejected_by\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"detected_condition\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"proposed_corrective_action\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"executed_action_description\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"rejection_reason\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"executed_at\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"executed_by_user_id\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"rejected_at\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN IF EXISTS \"rejected_by_user_id\"");
  }
}
