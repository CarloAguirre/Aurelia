import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type LibreTranslateResponse = {
  translatedText?: unknown;
  error?: unknown;
};

const TRANSLATION_BATCH_SIZE = 20;
const TRANSLATION_BATCH_CHARACTER_LIMIT = 6000;

@Injectable()
export class ReportTranslationService {
  private readonly logger = new Logger(ReportTranslationService.name);
  private readonly translationCache = new Map<string, string>();
  private readonly baseUrl: string;
  private readonly apiKey: string | null;
  private readonly timeoutMs: number;
  private readonly required: boolean;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.normalizeBaseUrl(
      this.configService.get<string>('reportTranslation.baseUrl') ?? 'http://localhost:5000',
    );
    this.apiKey = this.configService.get<string | null>('reportTranslation.apiKey') ?? null;
    this.timeoutMs = this.configService.get<number>('reportTranslation.timeoutMs') ?? 30000;
    this.required = this.configService.get<boolean>('reportTranslation.required') ?? true;
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

    for (const batch of this.translationBatches(missingValues)) {
      try {
        const translations = await this.requestTranslationBatch(batch);
        batch.forEach((source, index) => {
          const translation = translations[index]?.trim() ?? '';
          if (translation) this.translationCache.set(source, translation);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        this.logger.warn(`LibreTranslate report translation failed: ${message}`);
        if (this.required) {
          throw new ServiceUnavailableException(
            'No fue posible generar el informe bilingüe porque el servicio de traducción no está disponible.',
          );
        }
      }
    }

    return normalizedValues.map((value) =>
      value ? this.translationCache.get(value) ?? '' : '',
    );
  }

  private async requestTranslationBatch(values: string[]): Promise<string[]> {
    if (values.length === 0) return [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const body: Record<string, unknown> = {
      q: values,
      source: 'es',
      target: 'en',
      format: 'text',
    };
    if (this.apiKey) body.api_key = this.apiKey;

    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const rawBody = await response.text();
      const payload = this.parseResponse(rawBody);

      if (!response.ok) {
        const detail = typeof payload.error === 'string' ? payload.error : `HTTP ${response.status}`;
        throw new Error(detail);
      }

      const translatedText = payload.translatedText;
      if (typeof translatedText === 'string' && values.length === 1) {
        return [translatedText.trim()];
      }
      if (
        Array.isArray(translatedText)
        && translatedText.length === values.length
        && translatedText.every((value): value is string => typeof value === 'string' && value.trim().length > 0)
      ) {
        return translatedText.map((value) => value.trim());
      }

      throw new Error('LibreTranslate returned an invalid translation payload.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`timeout after ${this.timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseResponse(value: string): LibreTranslateResponse {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as LibreTranslateResponse
        : {};
    } catch {
      return {};
    }
  }

  private translationBatches(values: string[]): string[][] {
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentCharacters = 0;

    for (const value of values) {
      const exceedsSize = currentBatch.length >= TRANSLATION_BATCH_SIZE;
      const exceedsCharacters =
        currentBatch.length > 0
        && currentCharacters + value.length > TRANSLATION_BATCH_CHARACTER_LIMIT;
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

  private normalizeBaseUrl(value: string): string {
    return value.trim().replace(/\/+$/, '');
  }
}
