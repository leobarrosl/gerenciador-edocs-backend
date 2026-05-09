import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import { Prisma } from '@prisma/client';
import { PdfService } from 'src/pdf/pdf.service';
import { PDFOptions } from 'puppeteer';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly templateService: TemplatesService
  ) { }


  async create(userId: string, dto: CreateDocumentDto) {
    const template = await this.templateService.findById(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Template com ID ${dto.templateId} não encontrado`);
    }
    const content = this.replaceVariables(template.content, template.variables as { key: string, label: string, defaultValue: string }[], dto.values as Record<string, string>[]);
    return await this.prisma.document.create({ data: { ...dto, content, userId } });
  }

  async findAll(params: {
    page?: number,
    size?: number,
    initialDate?: Date,
    finalDate?: Date,
    userId?: string,
    templateId?: string,
  }) {
    const { userId, templateId, page, size } = params;
    const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: size });
    return paginate(
      this.prisma.document,
      {
        where: {
          userId,
          templateId,
          createdAt: {
            gte: params.initialDate,
            lte: params.finalDate
          }
        },
        orderBy: { createdAt: 'desc' },
      },
      { page, perPage: size },
    );
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({ where: { id } });
  }

  async delete(id: string) {
    try {
      return await this.prisma.document.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Documento com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }

  async generateDocument(id: string): Promise<Buffer> {
    const document = await this.findById(id);
    if (!document) {
      throw new NotFoundException(`Documento com ID ${id} não encontrado`);
    }

    const template = await this.templateService.findById(document.templateId);
    if (!template) {
      throw new NotFoundException(`Template com ID ${document.templateId} não encontrado`);
    }

    const pdfOptions = (template.pdfOptions as PDFOptions) ?? undefined;

    return this.pdfService.generatePdfFromHtml(document.content, pdfOptions);
  }

  replaceVariables(content: string, variables: { key: string, label: string, defaultValue: string }[], values: Record<string, string>[]) {
    if (!values) {
      return content;
    }

    let result = content;
    for (const obj of variables) {
      const value = values.find((v) => v.key === obj.key)?.value || obj.defaultValue;
      result = result.replaceAll(`{{${obj.key}}}`, value);
    }
    return result;
  }
}
