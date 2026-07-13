import type { DataSource } from 'typeorm';
import { runDemoSeed } from './002-seed-demo-data';
import { runFindingClassificationsSeed } from './003-seed-finding-classifications';
import { runPhase1Seed } from './001-seed-phase1';
import { runResponsiblesSeed } from './004-seed-responsibles';

const seedRegistry = {
  phase1: runPhase1Seed,
  demo: runDemoSeed,
  'finding-classifications': runFindingClassificationsSeed,
  responsibles: runResponsiblesSeed,
} as const;

export type SeedName = keyof typeof seedRegistry;

export const availableSeedNames = Object.keys(seedRegistry) as SeedName[];

export function isSeedName(name: string): name is SeedName {
  return Object.prototype.hasOwnProperty.call(seedRegistry, name);
}

export async function runSeedByName(name: SeedName, dataSource: DataSource): Promise<void> {
  await seedRegistry[name](dataSource);
}
