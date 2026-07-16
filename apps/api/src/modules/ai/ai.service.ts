import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AiSuggestType, type AiSuggestResponse } from '@aurelia/contracts';
import { AiSuggestDto } from './dto/ai-suggest.dto';

const FALLBACKS: Record<AiSuggestType, string> = {
  [AiSuggestType.CORRECTIVE_MEASURE]:
    'Corregir la condición identificada antes del próximo turno. Registrar evidencia fotográfica y notificar al supervisor de área.',
  [AiSuggestType.COMPANY_SUGGESTION]:
    'SOMACOR cuenta con experiencia en esta área. Se recomienda asignar al supervisor de turno para gestionar la corrección.',
};

const SYSTEM_BASE =
  'Eres AurelIA, asistente de inspecciones de Gold Fields Salares Norte. Responde en español, conciso, sin markdown, sin asteriscos, sin listas. Máximo 2 oraciones.';
const TRANSLATION_SYSTEM =
  'You are a professional mining safety and environmental translator. Translate Chilean Spanish into concise, natural professional English. Preserve names, codes, numbers, acronyms and technical meaning. Return only a valid JSON array of strings in the same order and with the same number of items as the input. Do not add explanations or markdown.';
const TRANSLATION_BATCH_SIZE = 20;
const TRANSLATION_BATCH_CHARACTER_LIMIT = 6000;

@Injectable()
export class AiService {
  private readonly client: Anthropic | null;
  private readonly translationCache = new Map<string, string>();

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string | null>('ai.anthropicApiKey');
    this.client = new Anthropic({
      apiKey: apiKey ?? undefined,
    });
    if (!apiKey) this.client = null;
  }

  async suggest(dto: AiSuggestDto): Promise<AiSuggestResponse> {
    if (!this.client) return { suggestion: FALLBACKS[dto.type], type: dto.type, fallback: true };

    const { systemPrompt, userPrompt } = this.buildPrompts(dto);

    try {
      const message = await Promise.race<Anthropic.Message>([
        this.client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 12000),
        ),
      ]);

      const block = message.content?.[0];
      const suggestion = block?.type === 'text' ? block.text : FALLBACKS[dto.type];
      return { suggestion, type: dto.type, fallback: false };
    } catch {
      return { suggestion: FALLBACKS[dto.type], type: dto.type, fallback: true };
    }
  }

  async translateToEnglish(values: string[]): Promise<string[]> {
    const normalizedValues = values.map((value) => value.trim());
    const missingValues = Array.from(
      new Set(
        normalizedValues.filter(
          (value) => value.length > 0 && !this.translationCache.has(value),
        ),
      ),
    );

    if (this.client && missingValues.length > 0) {
      for (const batch of this.translationBatches(missingValues)) {
        const translations = await this.requestTranslationBatch(batch);
        batch.forEach((source, index) => {
          const translation = translations[index]?.trim() ?? '';
          if (translation) this.translationCache.set(source, translation);
        });
      }
    }

    return normalizedValues.map((value) =>
      value ? this.translationCache.get(value) ?? '' : '',
    );
  }

  private async requestTranslationBatch(values: string[]): Promise<string[]> {
    if (!this.client || values.length === 0) return [];

    try {
      const maxTokens = Math.min(
        2400,
        Math.max(400, Math.ceil(values.reduce((total, value) => total + value.length, 0) / 2)),
      );
      const message = await Promise.race<Anthropic.Message>([
        this.client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          system: TRANSLATION_SYSTEM,
          messages: [
            {
              role: 'user',
              content: `Translate this JSON array from Spanish to English:\n${JSON.stringify(values)}`,
            },
          ],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI translation timeout')), 12000),
        ),
      ]);
      const block = message.content?.[0];
      if (block?.type !== 'text') return [];
      return this.parseTranslationArray(block.text, values.length);
    } catch {
      return [];
    }
  }

  private parseTranslationArray(value: string, expectedLength: number): string[] {
    const start = value.indexOf('[');
    const end = value.lastIndexOf(']');
    if (start < 0 || end <= start) return [];

    try {
      const parsed: unknown = JSON.parse(value.slice(start, end + 1));
      if (!Array.isArray(parsed) || parsed.length !== expectedLength) return [];
      const translations = parsed.map((item) =>
        typeof item === 'string' ? item.trim() : '',
      );
      return translations.every((translation) => translation.length > 0) ? translations : [];
    } catch {
      return [];
    }
  }

  private translationBatches(values: string[]): string[][] {
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentCharacters = 0;

    for (const value of values) {
      const exceedsSize = currentBatch.length >= TRANSLATION_BATCH_SIZE;
      const exceedsCharacters =
        currentBatch.length > 0 && currentCharacters + value.length > TRANSLATION_BATCH_CHARACTER_LIMIT;
      if (exceedsSize || exceedsCharacters) {
        batches.push(currentBatch);
        currentBatch = [];
        currentCharacters = 0;
      }
      currentBatch.push(value);
      currentCharacters += value.length;
    }

    if (currentBatch.length > 0) batches.push(currentBatch);
    return batches;
  }

  private toStringOrFallback(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private buildPrompts(dto: AiSuggestDto): { systemPrompt: string; userPrompt: string } {
    const context = dto.context ?? {};

    if (dto.type === AiSuggestType.CORRECTIVE_MEASURE) {
      const area = this.toStringOrFallback(context.area, 'área no informada');
      const sector = this.toStringOrFallback(context.sector, 'sector no informado');
      const description = this.toStringOrFallback(context.description, 'sin descripción');
      return {
        systemPrompt: `${SYSTEM_BASE} Especialista en medidas correctivas de seguridad y medio ambiente en minería.`,
        userPrompt: `Inspector reporta en ${area} · ${sector}: "${description}". Propón una medida correctiva breve y específica para este hallazgo en faena minera.`,
      };
    }

    const area = this.toStringOrFallback(context.area, 'área no informada');
    const sector = this.toStringOrFallback(context.sector, 'sector no informado');
    const companies = this.toStringArray(context.companies);
    const companiesText = companies.length > 0 ? companies.join(', ') : 'Sin empresas informadas';
    return {
      systemPrompt: `${SYSTEM_BASE} Especialista en gestión de empresas contratistas (EECC) en faenas mineras.`,
      userPrompt: `Para resolver hallazgos en ${area} · ${sector}, ¿qué empresa de las siguientes recomendarías? Empresas: ${companiesText}. Di solo el nombre exacto de la empresa y una breve justificación en 1 oración.`,
    };
  }
}
