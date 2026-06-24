import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AiSuggestDto, AiSuggestResponse, AiSuggestType } from './dto/ai-suggest.dto';

const FALLBACKS: Record<AiSuggestType, string> = {
  [AiSuggestType.CORRECTIVE_MEASURE]:
    'Corregir la condición identificada antes del próximo turno. Registrar evidencia fotográfica y notificar al supervisor de área.',
  [AiSuggestType.COMPANY_SUGGESTION]:
    'SOMACOR cuenta con experiencia en esta área. Se recomienda asignar al supervisor de turno para gestionar la corrección.',
};

const SYSTEM_BASE =
  'Eres AurelIA, asistente de inspecciones de Gold Fields Salares Norte. Responde en español, conciso, sin markdown, sin asteriscos, sin listas. Máximo 2 oraciones.';

@Injectable()
export class AiService {
  private readonly client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') ?? '',
    });
  }

  async suggest(dto: AiSuggestDto): Promise<AiSuggestResponse> {
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

  private buildPrompts(dto: AiSuggestDto): { systemPrompt: string; userPrompt: string } {
    if (dto.type === AiSuggestType.CORRECTIVE_MEASURE) {
      const { area, sector, description } = dto.context as {
        area: string;
        sector: string;
        description: string;
      };
      return {
        systemPrompt: `${SYSTEM_BASE} Especialista en medidas correctivas de seguridad y medio ambiente en minería.`,
        userPrompt: `Inspector reporta en ${area} · ${sector}: "${description}". Propón una medida correctiva breve y específica para este hallazgo en faena minera.`,
      };
    }

    const { area, sector, companies } = dto.context as {
      area: string;
      sector: string;
      companies: string[];
    };
    return {
      systemPrompt: `${SYSTEM_BASE} Especialista en gestión de empresas contratistas (EECC) en faenas mineras.`,
      userPrompt: `Para resolver hallazgos en ${area} · ${sector}, ¿qué empresa de las siguientes recomendarías? Empresas: ${companies.join(', ')}. Di solo el nombre exacto de la empresa y una breve justificación en 1 oración.`,
    };
  }
}
