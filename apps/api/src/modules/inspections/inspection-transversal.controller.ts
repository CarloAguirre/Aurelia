import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CommentResponse, EvidenceLinkResponse, EvidenceResponse } from '@aurelia/contracts';
import { CreateInspectionCommentDto } from './dto/create-inspection-comment.dto';
import { LinkInspectionEvidenceDto } from './dto/link-inspection-evidence.dto';
import { InspectionTransversalService } from './inspection-transversal.service';

@Controller('inspections')
export class InspectionTransversalController {
  constructor(private readonly inspectionTransversalService: InspectionTransversalService) {}

  @Get(':id/evidences')
  findEvidences(@Param('id', ParseUUIDPipe) id: string): Promise<EvidenceResponse[]> {
    return this.inspectionTransversalService.findEvidences(id);
  }

  @Post(':id/evidences/:evidenceId/link')
  linkEvidence(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
    @Body() dto: LinkInspectionEvidenceDto,
  ): Promise<EvidenceLinkResponse> {
    return this.inspectionTransversalService.linkEvidence(id, evidenceId, dto, null);
  }

  @Get(':id/comments')
  findComments(@Param('id', ParseUUIDPipe) id: string): Promise<CommentResponse[]> {
    return this.inspectionTransversalService.findComments(id);
  }

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
}
