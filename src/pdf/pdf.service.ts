import { Injectable } from '@nestjs/common';
import puppeteer, { PDFOptions } from 'puppeteer';

@Injectable()
export class PdfService {
  async generatePdfFromHtml(html: string, options?: PDFOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        ...options,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
