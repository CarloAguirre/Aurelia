import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export type ReportPdfDocument = PDFKit.PDFDocument;

export interface ReportPdfOptions {
  title?: string;
  author?: string;
  subject?: string;
}

@Injectable()
export class ReportPdfService {
  async render(
    build: (document: ReportPdfDocument) => Promise<void> | void,
    options: ReportPdfOptions = {},
  ): Promise<Buffer> {
    const document = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
      compress: true,
      info: {
        Title: options.title ?? 'Aurelia Report',
        Author: options.author ?? 'Aurelia',
        Subject: options.subject ?? 'Aurelia reporting',
        Creator: 'Aurelia',
        Producer: 'Aurelia',
      },
    });
    const chunks: Buffer[] = [];
    const completed = new Promise<Buffer>((resolve, reject) => {
      document.on('data', (chunk: Buffer | Uint8Array) => chunks.push(Buffer.from(chunk)));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);
    });

    try {
      await build(document);
      document.end();
    } catch (error) {
      document.end();
      throw error;
    }

    return completed;
  }
}
