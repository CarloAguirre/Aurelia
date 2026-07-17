import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoSchemaSync1784042871872 implements MigrationInterface {
  name = 'AutoSchemaSync1784042871872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"detected_condition\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"proposed_corrective_action\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"executed_action_description\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"rejection_reason\" text");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"executed_at\" TIMESTAMP WITH TIME ZONE");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"executed_by_user_id\" uuid");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"rejected_at\" TIMESTAMP WITH TIME ZONE");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD \"rejected_by_user_id\" uuid");
    await queryRunner.query("ALTER TYPE \"public\".\"inspection_finding_status\" RENAME TO \"inspection_finding_status_old\"");
    await queryRunner.query("CREATE TYPE \"public\".\"inspection_finding_status\" AS ENUM('open', 'in_progress', 'closed', 'rejected', 'cancelled')");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" DROP DEFAULT");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" TYPE \"public\".\"inspection_finding_status\" USING \"status\"::\"text\"::\"public\".\"inspection_finding_status\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" SET DEFAULT 'open'");
    await queryRunner.query("DROP TYPE \"public\".\"inspection_finding_status_old\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD CONSTRAINT \"fk_if_executed_by\" FOREIGN KEY (\"executed_by_user_id\") REFERENCES \"users\"(\"id\") ON DELETE SET NULL ON UPDATE NO ACTION");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ADD CONSTRAINT \"fk_if_rejected_by\" FOREIGN KEY (\"rejected_by_user_id\") REFERENCES \"users\"(\"id\") ON DELETE SET NULL ON UPDATE NO ACTION");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"detected_condition\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"proposed_corrective_action\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"executed_action_description\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"rejection_reason\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"executed_at\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"executed_by_user_id\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"rejected_at\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP COLUMN \"rejected_by_user_id\"");
    await queryRunner.query("ALTER TYPE \"public\".\"inspection_finding_status_old\" RENAME TO \"inspection_finding_status\"");
    await queryRunner.query("DROP TYPE \"public\".\"inspection_finding_status\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" SET DEFAULT 'open'");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" TYPE \"public\".\"inspection_finding_status_old\" USING \"status\"::\"text\"::\"public\".\"inspection_finding_status_old\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" ALTER COLUMN \"status\" DROP DEFAULT");
    await queryRunner.query("CREATE TYPE \"public\".\"inspection_finding_status_old\" AS ENUM('open', 'in_progress', 'closed', 'cancelled')");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP CONSTRAINT \"fk_if_executed_by\"");
    await queryRunner.query("ALTER TABLE \"inspection_findings\" DROP CONSTRAINT \"fk_if_rejected_by\"");
  }
}
