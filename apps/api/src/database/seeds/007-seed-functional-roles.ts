import 'reflect-metadata';
import { config } from 'dotenv';
import type { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { MigrateFunctionalRoles1783100000000 } from '../migrations/1783100000000-MigrateFunctionalRoles';

config();

export async function runFunctionalRolesSeed(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await new MigrateFunctionalRoles1783100000000().up(queryRunner);
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function main(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  try {
    await runFunctionalRolesSeed(dataSource);
    console.log('Functional roles seed applied.');
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error('Functional roles seed failed:', error);
    process.exit(1);
  });
}
