import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import type { AddressInfo } from 'net';
import { AppModule } from '../app.module';

type JsonObject = Record<string, unknown>;

type InspectionTemplate = {
  id: string;
  inspectionTypeId: string;
  sections: Array<{
    items: Array<{ id: string }>;
  }>;
};

type CatalogRow = {
  id: string;
};

const asArray = <T>(value: unknown, label: string): T[] => {
  if (!Array.isArray(value)) throw new Error(`${label} did not return an array`);
  return value as T[];
};

const asObject = <T extends JsonObject>(value: unknown, label: string): T => {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(`${label} did not return an object`);
  return value as T;
};

const ensureId = (value: unknown, label: string): string => {
  const row = asObject<JsonObject>(value, label);
  if (typeof row.id !== 'string' || row.id.length === 0) throw new Error(`${label} did not return an id`);
  return row.id;
};

async function request(baseUrl: string, method: string, path: string, body?: JsonObject, expectedStatus = 200): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path} expected ${expectedStatus} but got ${response.status}: ${text}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!text) return null;
  if (contentType.includes('application/json')) return JSON.parse(text);
  return text;
}

async function runInspectionFlow(baseUrl: string): Promise<void> {
  await request(baseUrl, 'GET', '/inspections/types');
  const templates = asArray<InspectionTemplate>(await request(baseUrl, 'GET', '/inspections/templates'), 'inspection templates');
  const template = templates[0];
  if (!template?.id || !template.inspectionTypeId) throw new Error('inspection template seed is missing');
  const checklistItemId = template.sections?.[0]?.items?.[0]?.id;
  if (!checklistItemId) throw new Error('inspection checklist item seed is missing');

  const unique = Date.now();
  const inspection = asObject<JsonObject>(
    await request(baseUrl, 'POST', '/inspections', {
      inspectionTypeId: template.inspectionTypeId,
      templateId: template.id,
      title: `Smoke inspection ${unique}`,
      description: 'Smoke test inspection flow',
    }, 201),
    'create inspection',
  );
  const inspectionId = ensureId(inspection, 'create inspection');

  await request(baseUrl, 'GET', '/inspections');
  await request(baseUrl, 'GET', `/inspections/${inspectionId}`);
  await request(baseUrl, 'PATCH', `/inspections/${inspectionId}/status`, { status: 'in_progress', comment: 'Smoke start' });
  await request(baseUrl, 'POST', `/inspections/${inspectionId}/answers`, {
    checklistItemId,
    answerValue: 'compliant',
    notes: 'Smoke answer',
  }, 201);

  const finding = asObject<JsonObject>(
    await request(baseUrl, 'POST', `/inspections/${inspectionId}/findings`, {
      checklistItemId,
      title: `Smoke finding ${unique}`,
      description: 'Smoke finding description',
      severity: 'low',
    }, 201),
    'create inspection finding',
  );
  const findingId = ensureId(finding, 'create inspection finding');

  await request(baseUrl, 'GET', `/inspections/${inspectionId}/findings`);
  await request(baseUrl, 'POST', `/inspections/findings/${findingId}/followups`, {
    status: 'completed',
    description: 'Smoke followup completed',
    performedAt: new Date().toISOString(),
  }, 201);
  await request(baseUrl, 'PATCH', `/inspections/findings/${findingId}`, {
    status: 'closed',
    reason: 'Smoke finding closed',
  });
  await request(baseUrl, 'POST', `/inspections/${inspectionId}/comments`, {
    body: 'Smoke inspection comment',
    isInternal: false,
  }, 201);
  await request(baseUrl, 'GET', `/inspections/${inspectionId}/comments`);
  await request(baseUrl, 'GET', `/inspections/${inspectionId}/evidences`);
  await request(baseUrl, 'GET', `/inspections/${inspectionId}/export`);
  await request(baseUrl, 'GET', `/inspections/${inspectionId}/export/pdf`);
  await request(baseUrl, 'POST', `/inspections/${inspectionId}/close`, { reason: 'Smoke close' }, 201);
  await request(baseUrl, 'GET', '/inspections/dashboard/summary');
}

async function runIncidentFlow(baseUrl: string): Promise<void> {
  const types = asArray<CatalogRow>(await request(baseUrl, 'GET', '/incidents/types'), 'incident types');
  const levels = asArray<CatalogRow>(await request(baseUrl, 'GET', '/incidents/levels'), 'incident levels');
  const incidentTypeId = types[0]?.id;
  const incidentLevelId = levels[0]?.id;
  if (!incidentTypeId || !incidentLevelId) throw new Error('incident catalog seed is missing');

  const unique = Date.now();
  const incident = asObject<JsonObject>(
    await request(baseUrl, 'POST', '/incidents', {
      incidentTypeId,
      incidentLevelId,
      title: `Smoke incident ${unique}`,
      description: 'Smoke test incident flow',
      occurredAt: new Date().toISOString(),
      immediateResponseSummary: 'Smoke immediate response',
      environmentalImpactSummary: 'Smoke impact summary',
    }, 201),
    'create incident',
  );
  const incidentId = ensureId(incident, 'create incident');

  await request(baseUrl, 'GET', '/incidents');
  await request(baseUrl, 'GET', `/incidents/${incidentId}`);
  await request(baseUrl, 'PATCH', `/incidents/${incidentId}/status`, { status: 'under_review', comment: 'Smoke review' });
  await request(baseUrl, 'POST', `/incidents/${incidentId}/flash-report`, {
    summary: 'Smoke flash report summary',
    immediateCauses: 'Smoke immediate causes',
    affectedComponents: 'Smoke affected components',
    potentialImpact: 'Smoke potential impact',
    reporterName: 'Smoke tester',
  }, 201);
  await request(baseUrl, 'GET', `/incidents/${incidentId}/flash-report`);

  const incidentEvidence = asObject<JsonObject>(
    await request(baseUrl, 'POST', '/evidences', {
      title: `Smoke incident evidence ${unique}`,
      description: 'Smoke evidence linked to incident',
      evidenceType: 'photo',
      capturedAt: new Date().toISOString(),
    }, 201),
    'create incident evidence',
  );
  const incidentEvidenceId = ensureId(incidentEvidence, 'create incident evidence');
  await request(baseUrl, 'POST', `/incidents/${incidentId}/evidences/${incidentEvidenceId}/link`, { relationType: 'smoke_evidence' }, 201);
  await request(baseUrl, 'GET', `/incidents/${incidentId}/evidences`);
  await request(baseUrl, 'POST', `/incidents/${incidentId}/comments`, {
    body: 'Smoke incident comment',
    isInternal: false,
  }, 201);
  await request(baseUrl, 'GET', `/incidents/${incidentId}/comments`);
  await request(baseUrl, 'GET', `/incidents/${incidentId}/export`);
  await request(baseUrl, 'GET', `/incidents/${incidentId}/export/pdf`);

  const immediateAction = asObject<JsonObject>(
    await request(baseUrl, 'POST', `/incidents/${incidentId}/immediate-actions`, {
      description: 'Smoke immediate action',
      status: 'completed',
      performedAt: new Date().toISOString(),
    }, 201),
    'create immediate action',
  );
  const immediateActionId = ensureId(immediateAction, 'create immediate action');
  await request(baseUrl, 'GET', `/incidents/${incidentId}/immediate-actions`);
  await request(baseUrl, 'PATCH', `/incidents/immediate-actions/${immediateActionId}`, { status: 'completed' });

  const investigation = asObject<JsonObject>(
    await request(baseUrl, 'POST', `/incidents/${incidentId}/investigations`, {
      method: 'five_why',
      title: 'Smoke investigation',
      summary: 'Smoke investigation summary',
      startedAt: new Date().toISOString(),
    }, 201),
    'create investigation',
  );
  const investigationId = ensureId(investigation, 'create investigation');
  await request(baseUrl, 'GET', `/incidents/${incidentId}/investigations`);
  await request(baseUrl, 'POST', `/incidents/investigations/${investigationId}/five-why`, {
    problemStatement: 'Smoke problem statement',
    why1: 'Smoke why 1',
    why2: 'Smoke why 2',
    rootCause: 'Smoke root cause',
  }, 201);
  await request(baseUrl, 'POST', `/incidents/investigations/${investigationId}/peepo`, {
    people: 'Smoke people',
    environment: 'Smoke environment',
    equipment: 'Smoke equipment',
    procedures: 'Smoke procedures',
    organization: 'Smoke organization',
  }, 201);

  const actionPlan = asObject<JsonObject>(
    await request(baseUrl, 'POST', `/incidents/${incidentId}/action-plans`, {
      investigationId,
      title: 'Smoke action plan',
      description: 'Smoke action plan description',
      dueAt: new Date(Date.now() + 86_400_000).toISOString(),
      status: 'open',
    }, 201),
    'create action plan',
  );
  const actionPlanId = ensureId(actionPlan, 'create action plan');
  await request(baseUrl, 'GET', `/incidents/${incidentId}/action-plans`);
  await request(baseUrl, 'POST', `/incidents/${incidentId}/close`, { comment: 'Should fail with open action plan' }, 400);
  await request(baseUrl, 'PATCH', `/incidents/action-plans/${actionPlanId}`, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
  await request(baseUrl, 'POST', `/incidents/${incidentId}/close`, { comment: 'Smoke incident closed' }, 201);
  await request(baseUrl, 'GET', '/incidents/dashboard/summary');
}

async function runSprFlow(baseUrl: string): Promise<void> {
  await request(baseUrl, 'GET', '/spr/groups');
  await request(baseUrl, 'GET', '/spr/measure-groups');
  await request(baseUrl, 'GET', '/spr/units');
  const parameters = asArray<CatalogRow>(await request(baseUrl, 'GET', '/spr/parameters'), 'SPR parameters');
  await request(baseUrl, 'GET', '/spr/assignments');

  const parameterId = parameters[0]?.id;
  if (!parameterId) throw new Error('SPR parameter seed is missing');

  const unique = Date.now();
  const periodYear = 2000 + (unique % 100);
  const periodMonth = 1 + (Math.floor(unique / 1000) % 12);

  const record = asObject<JsonObject>(
    await request(baseUrl, 'POST', '/spr/monthly-records', {
      parameterId,
      periodYear,
      periodMonth,
      numericValue: 123.45,
      notes: 'Smoke SPR monthly record',
    }, 201),
    'create SPR monthly record',
  );
  const recordId = ensureId(record, 'create SPR monthly record');

  await request(baseUrl, 'GET', `/spr/monthly-records?periodYear=${periodYear}&periodMonth=${periodMonth}`);
  await request(baseUrl, 'GET', `/spr/monthly-records/${recordId}`);
  await request(baseUrl, 'PATCH', `/spr/monthly-records/${recordId}`, {
    numericValue: 150.75,
    notes: 'Smoke SPR update',
  });
  await request(baseUrl, 'PATCH', `/spr/monthly-records/${recordId}/status`, {
    status: 'submitted',
    notes: 'Smoke SPR submitted',
  });
  await request(baseUrl, 'PATCH', `/spr/monthly-records/${recordId}/status`, {
    status: 'approved',
    notes: 'Smoke SPR approved',
  });
}

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  await app.listen(0);

  const address = app.getHttpServer().address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  try {
    await request(baseUrl, 'GET', '/health');
    await runInspectionFlow(baseUrl);
    await runIncidentFlow(baseUrl);
    await runSprFlow(baseUrl);
    console.log('api smoke tests passed');
  } finally {
    await app.close();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
