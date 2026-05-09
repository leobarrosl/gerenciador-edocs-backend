import { PDFOptions } from 'puppeteer';
export declare class PdfService {
    generatePdfFromHtml(html: string, options?: PDFOptions): Promise<Buffer>;
}
