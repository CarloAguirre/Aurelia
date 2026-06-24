import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CommentResponse, EvidenceLinkResponse, EvidenceResponse } from '@aurelia/contracts';
import { CreateIncidentCommentDto } from './dto/create-incident-comment.dto';
import { LinkIncidentEvidenceDto } from './dto/link-incident-evidence.dto';
import { IncidentTransversalService } from './incident-transversal.service';

@Controller('incidents')
export class IncidentTransversalController {
  constructor(private readonly incidentTransversalService: IncidentTransversalService) {}

  @Get(':id/evidences')
  findEvidences(@Param('id', ParseUUIDPipe) id: string): Promise<EvidenceResponse[]> {
    return this.incidentTransversalService.findEvidences(id);
  }

  @Post(':id/evidences/:evidenceId/link')
  linkEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
    @Body() dto: LinkIncidentEvidenceDto,
  ): Promise<EvidenceLinkResponse> {
    return this.incidentTransversalService.linkEvidence(id, evidenceId, dto, null);
  }

  @Get(':id/comments')
  findComments(@Param('id', ParseUUIDPipe) id: string): Promise<CommentResponse[]> {
    return this.incidentTransversalService.findComments(id);
  }

  @Post(':id/comments')
  createComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIncidentCommentDto,
  ): Promise<CommentResponse> {
    return this.incidentTransversalService.createComment(id, dto, null);
  }

  @Get(':id/export')
  getExportPayload(@Param('id', ParseUUIDPipe) id: string): Promise<Record<string, unknown>> {
    return this.incidentTransversalService.getExportPayload(id);
  }

  @Get(':id/export/pdf')
  async getExportPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ): Promise<void> {
    const pdf = await this.incidentTransversalService.getExportPdf(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="incident-${id}.pdf"`);
    response.send(pdf);
  }
}
