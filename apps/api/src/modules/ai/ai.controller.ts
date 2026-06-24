import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiSuggestDto, AiSuggestResponse } from './dto/ai-suggest.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest')
  suggest(@Body() dto: AiSuggestDto): Promise<AiSuggestResponse> {
    return this.aiService.suggest(dto);
  }
}
