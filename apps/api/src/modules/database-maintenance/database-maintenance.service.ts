import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataSource, Migration, MigrationExecutor, QueryRunner } from 'typeorm';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { availableSeedNames, isSeedName, runSeedByName } from '../../database/seeds/seed-registry';
import { RunDatabaseMaintenanceDto } from './dto/run-database-maintenance.dto';

type SqlQuery = {
  query: string;
  parameters?: unknown[];
};

type MaintenancePhase =
  | 'connect'
  | 'lock'
  | 'plan'
  | 'review'
  | 'artifact'
  | 'migration'
  | 'seed';

type MigrationStatus = 'applied' | 'noop' | 'review_required';
type PlanStatus = 'ready' | 'noop' | 'review_required';
type SeedStatus = 'applied' | 'skipped' | 'failed';

export interface DatabaseMaintenanceErrorInfo {
  phase: MaintenancePhase;
  message: string;
  details?: string;
  stack?: string;
}

export interface DatabaseMaintenanceSeedResult {
  seed: string;
  status: SeedStatus;
  error?: string;
  details?: string;
}

export interface DatabaseMaintenanceMigrationResult {
  status: MigrationStatus | 'failed';
  filePath: string | null;
  migrationName: string | null;
  upQueries: number;
  downQueries: number;
  riskyQueries: string[];
}

export interface DatabaseMaintenanceResult {
  migration: DatabaseMaintenanceMigrationResult;
  seeds: DatabaseMaintenanceSeedResult[];
  availableSeeds: string[];
  error: DatabaseMaintenanceErrorInfo | null;
}

export interface DatabaseMaintenancePlanResult {
  migration: {
    status: PlanStatus;
    filePath: string | null;
    migrationName: string | null;
    upQueries: number;
    downQueries: number;
    riskyQueries: string[];
  };
  availableSeeds: string[];
}

@Injectable()
export class DatabaseMaintenanceService {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);

  constructor(private readonly dataSource: DataSource) {}

  async plan(): Promise<DatabaseMaintenancePlanResult> {
    this.logger.log('Planning database maintenance');
    const schemaPlan = await this.createSchemaPlan();
    this.logger.log(`Plan generated with ${schemaPlan.upQueries.length} up queries and ${schemaPlan.downQueries.length} down queries`);

    if (schemaPlan.upQueries.length === 0) {
      return {
        migration: {
          status: 'noop',
          filePath: null,
          migrationName: null,
          upQueries: 0,
          downQueries: 0,
          riskyQueries: [],
        },
        availableSeeds: availableSeedNames,
      };
    }

    const migrationArtifact = this.buildMigrationArtifact();
    const riskyQueries = this.detectRiskyQueries(schemaPlan.upQueries);

    return {
      migration: {
        status: riskyQueries.length > 0 ? 'review_required' : 'ready',
        filePath: migrationArtifact.filePath,
        migrationName: migrationArtifact.migrationName,
        upQueries: schemaPlan.upQueries.length,
        downQueries: schemaPlan.downQueries.length,
        riskyQueries,
      },
      availableSeeds: availableSeedNames,
    };
  }

  async run(dto: RunDatabaseMaintenanceDto): Promise<DatabaseMaintenanceResult> {
    const requestedSeeds = this.normalizeSeeds(dto.seeds ?? []);
    const allowRisky = dto.allowRisky === true;
    this.logger.log(`Running database maintenance with seeds=[${requestedSeeds.join(', ')}], allowRisky=${allowRisky}`);
    const maintenanceRunner = this.dataSource.createQueryRunner();
    let lockAcquired = false;
    let schemaPlan: { upQueries: SqlQuery[]; downQueries: SqlQuery[] } | null = null;
    let migrationArtifact: { migrationName: string; filePath: string } | null = null;
    let phase: MaintenancePhase = 'connect';

    try {
      await maintenanceRunner.connect();
      phase = 'lock';
      this.logger.log('Acquiring maintenance advisory lock');
      await maintenanceRunner.query(`SELECT pg_advisory_lock(hashtext('aurelia_database_maintenance'))`);
      lockAcquired = true;

      phase = 'plan';
      schemaPlan = await this.createSchemaPlan();
      this.logger.log(`Schema plan resolved with ${schemaPlan.upQueries.length} up queries and ${schemaPlan.downQueries.length} down queries`);

      if (schemaPlan.upQueries.length === 0) {
        phase = 'seed';
        this.logger.log('No migration required, running requested seeds only');
        const seeds = await this.runSeeds(requestedSeeds);
        return {
          migration: {
            status: 'noop',
            filePath: null,
            migrationName: null,
            upQueries: 0,
            downQueries: 0,
            riskyQueries: [],
          },
          seeds,
          availableSeeds: availableSeedNames,
          error: null,
        };
      }

      phase = 'review';
      const riskyQueries = this.detectRiskyQueries(schemaPlan.upQueries);

      if (riskyQueries.length > 0 && !allowRisky) {
        migrationArtifact = this.buildMigrationArtifact();
        this.logger.warn(`Schema diff requires review. Generated artifact: ${migrationArtifact.filePath}`);
        return {
          migration: {
            status: 'review_required',
            filePath: migrationArtifact.filePath,
            migrationName: migrationArtifact.migrationName,
            upQueries: schemaPlan.upQueries.length,
            downQueries: schemaPlan.downQueries.length,
            riskyQueries,
          },
          seeds: requestedSeeds.map((seed) => ({ seed, status: 'skipped' })),
          availableSeeds: availableSeedNames,
          error: null,
        };
      }

      phase = 'artifact';
      migrationArtifact = this.writeMigrationArtifact(schemaPlan.upQueries, schemaPlan.downQueries);
      this.logger.log(`Generated maintenance migration artifact at ${migrationArtifact.filePath}`);
      phase = 'migration';
      this.logger.log(`Executing generated migration ${migrationArtifact.migrationName}`);
      await this.executeGeneratedMigration(maintenanceRunner, migrationArtifact.migrationName, schemaPlan.upQueries, schemaPlan.downQueries);
      this.logger.log(`Migration ${migrationArtifact.migrationName} executed successfully`);

      phase = 'seed';
      this.logger.log(`Running ${requestedSeeds.length} selected seed(s)`);
      const seeds = await this.runSeeds(requestedSeeds);
      this.logger.log(`Selected seeds completed: ${seeds.map((seed) => `${seed.seed}:${seed.status}`).join(', ') || 'none'}`);

      return {
        migration: {
          status: 'applied',
          filePath: migrationArtifact.filePath,
          migrationName: migrationArtifact.migrationName,
          upQueries: schemaPlan.upQueries.length,
          downQueries: schemaPlan.downQueries.length,
          riskyQueries: [],
        },
        seeds,
        availableSeeds: availableSeedNames,
        error: null,
      };
    } catch (error) {
      const failure = this.buildFailureInfo(phase, error);
      this.logger.error(`Database maintenance failed at phase ${phase}: ${failure.message}`, failure.stack);

      const seeds = requestedSeeds.map((seed, index) => ({
        seed,
        status: index === 0 ? 'skipped' : 'skipped',
      })) satisfies DatabaseMaintenanceSeedResult[];

      return {
        migration: {
          status: 'failed',
          filePath: migrationArtifact?.filePath ?? null,
          migrationName: migrationArtifact?.migrationName ?? null,
          upQueries: schemaPlan?.upQueries.length ?? 0,
          downQueries: schemaPlan?.downQueries.length ?? 0,
          riskyQueries: schemaPlan ? this.detectRiskyQueries(schemaPlan.upQueries) : [],
        },
        seeds,
        availableSeeds: availableSeedNames,
        error: failure,
      };
    } finally {
      try {
        if (lockAcquired) {
          this.logger.log('Releasing maintenance advisory lock');
          await maintenanceRunner.query(`SELECT pg_advisory_unlock(hashtext('aurelia_database_maintenance'))`);
        }
      } finally {
        await maintenanceRunner.release();
      }
    }
  }

  private async createSchemaPlan(): Promise<{ upQueries: SqlQuery[]; downQueries: SqlQuery[] }> {
    const schemaBuilder = this.dataSource.driver.createSchemaBuilder();
    const sql = await schemaBuilder.log();
    return {
      upQueries: sql.upQueries,
      downQueries: sql.downQueries,
    };
  }

  private buildMigrationArtifact(): { migrationName: string; filePath: string } {
    const timestamp = Date.now();
    const migrationName = `AutoSchemaSync${timestamp}`;
    const migrationFolder = join(tmpdir(), 'aurelia-database-maintenance', 'generated');
    const filePath = join(migrationFolder, `${timestamp}-auto-schema-sync.ts`);

    return { migrationName, filePath };
  }

  private writeMigrationArtifact(upQueries: SqlQuery[], downQueries: SqlQuery[]): { migrationName: string; filePath: string } {
    const artifact = this.buildMigrationArtifact();

    const migrationFolder = join(tmpdir(), 'aurelia-database-maintenance', 'generated');
    mkdirSync(migrationFolder, { recursive: true });
    writeFileSync(artifact.filePath, this.renderMigrationFile(artifact.migrationName, upQueries, downQueries), 'utf8');

    return artifact;
  }

  private renderMigrationFile(migrationName: string, upQueries: SqlQuery[], downQueries: SqlQuery[]): string {
    return [
      "import { MigrationInterface, QueryRunner } from 'typeorm';",
      '',
      `export class ${migrationName} implements MigrationInterface {`,
      `  name = '${migrationName}';`,
      '',
      '  public async up(queryRunner: QueryRunner): Promise<void> {',
      this.renderQueryBlock(upQueries),
      '  }',
      '',
      '  public async down(queryRunner: QueryRunner): Promise<void> {',
      this.renderQueryBlock(downQueries),
      '  }',
      '}',
      '',
    ].join('\n');
  }

  private renderQueryBlock(queries: SqlQuery[]): string {
    if (queries.length === 0) {
      return '    return;';
    }

    return queries
      .map((query) => {
        const parameters = query.parameters && query.parameters.length > 0
          ? `, ${JSON.stringify(query.parameters)}`
          : '';
        return `    await queryRunner.query(${JSON.stringify(query.query)}${parameters});`;
      })
      .join('\n');
  }

  private async executeGeneratedMigration(
    queryRunner: QueryRunner,
    migrationName: string,
    upQueries: SqlQuery[],
    downQueries: SqlQuery[],
  ): Promise<void> {
    const migrationTimestamp = Number(migrationName.replace(/^AutoSchemaSync/, ''));
    const migration = new Migration(
      undefined,
      migrationTimestamp,
      migrationName,
      {
        name: migrationName,
        async up(runner) {
          for (const query of upQueries) {
            await runner.query(query.query, query.parameters);
          }
        },
        async down(runner) {
          for (const query of downQueries) {
            await runner.query(query.query, query.parameters);
          }
        },
      },
      true,
    );

    const executor = new MigrationExecutor(this.dataSource, queryRunner);
    executor.transaction = 'all';
    await executor.executeMigration(migration);
  }

  private async runSeeds(seedNames: string[]): Promise<DatabaseMaintenanceSeedResult[]> {
    if (seedNames.length === 0) {
      this.logger.log('No seeds requested');
      return [];
    }

    const results: DatabaseMaintenanceSeedResult[] = [];

    for (const seedName of seedNames) {
      if (!isSeedName(seedName)) {
        throw new BadRequestException(`Unknown seed "${seedName}". Available seeds: ${availableSeedNames.join(', ')}`);
      }

      try {
        this.logger.log(`Running seed ${seedName}`);
        await runSeedByName(seedName, this.dataSource);
        this.logger.log(`Seed ${seedName} applied successfully`);
        results.push({ seed: seedName, status: 'applied' });
      } catch (error) {
        this.logger.error(`Seed ${seedName} failed`, error instanceof Error ? error.stack : undefined);
        results.push({
          seed: seedName,
          status: 'failed',
          error: this.describeError(error),
          details: error instanceof Error ? error.stack : undefined,
        });

        const remainingSeeds = seedNames.slice(results.length);
        for (const skippedSeed of remainingSeeds) {
          results.push({ seed: skippedSeed, status: 'skipped' });
        }
        break;
      }
    }

    return results;
  }

  private normalizeSeeds(seedNames: string[]): string[] {
    return Array.from(new Set(seedNames.map((seedName) => seedName.trim()).filter(Boolean)));
  }

  private detectRiskyQueries(queries: SqlQuery[]): string[] {
    return queries
      .map((query) => query.query)
      .filter((query) => this.isRiskyQuery(query));
  }

  private isRiskyQuery(query: string): boolean {
    const normalized = query.replace(/\s+/g, ' ').trim().toUpperCase();
    return [
      /\bDROP\b/,
      /\bTRUNCATE\b/,
      /\bRENAME\b/,
      /ALTER TABLE .* DROP COLUMN/i,
      /ALTER TABLE .* ALTER COLUMN .* TYPE/i,
      /DROP CONSTRAINT/i,
    ].some((pattern) => pattern.test(normalized));
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown seed error';
  }

  private buildFailureInfo(phase: MaintenancePhase, error: unknown): DatabaseMaintenanceErrorInfo {
    if (error instanceof Error) {
      return {
        phase,
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      phase,
      message: 'Unknown maintenance error',
    };
  }
}
