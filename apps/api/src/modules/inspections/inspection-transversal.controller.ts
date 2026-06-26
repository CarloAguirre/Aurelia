import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CommentResponse, EvidenceLinkResponse, EvidenceResponse } from '@aurelia/contracts';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CreateInspectionCommentDto } from './dto/create-inspection-comment.dto';
import { LinkInspectionEvidenceDto } from './dto/link-inspection-evidence.dto';
import { InspectionTransversalService } from './inspection-transversal.service';

@RequirePermissions('inspections:read')
@Controller('inspections')
export class InspectionTransversalController {
  constructor(private readonly inspectionTransversalService: InspectionTransversalService) {}

  @RequirePermissions('evidences:read')
  @Get(':id/evidences')
  findEvidences(@Param('id', ParseUUIDPipe) id: string): Promise<EvidenceResponse[]> {
    return this.inspectionTransversalService.findEvidences(id);
  }

  @RequirePermissions('inspections:write', 'evidences:write')
  @Post(':id/evidences/:evidenceId/link')
  linkEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
    @Body() dto: LinkInspectionEvidenceDto,
  ): Promise<EvidenceLinkResponse> {
    return this.inspectionTransversalService.linkEvidence(id, evidenceId, dto, null);
  }

  @RequirePermissions('comments:read')
  @Get(':id/comments')
  findComments(@Param('id', ParseUUIDPipe) id: string): Promise<CommentResponse[]> {
    return this.inspectionTransversalService.findComments(id);
  }

  @RequirePermissions('comments:write')
  @Post(':id/comments')
  createComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInspectionCommentDto,
  ): Promise<CommentResponse> {
    return this.inspectionTransversalService.createComment(id, dto, null);
  }

  @Get(':id/export')
  getExportPayload(@Param('id', ParseUUIDPipe) id: string): Promise<Record<string, unknown>> {
    return this.inspectionTransversalService.getExportPayload(id);
  }

  @Get(':id/export/pdf')
  async getExportPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ): Promise<void> {
    const pdf = await this.inspectionTransversalService.getExportPdf(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="inspection-${id}.pdf"`);
    response.send(pdf);
  }
}
