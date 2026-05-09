import { CreateDocumentDto } from './dto/create-document.dto';
import { PrismaService } from "../prisma/prisma.service";
import { PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import { Prisma } from '@prisma/client';
import { PdfService } from "../pdf/pdf.service";
import { TemplatesService } from "../templates/templates.service";
export declare class DocumentsService {
    private readonly prisma;
    private readonly pdfService;
    private readonly templateService;
    constructor(prisma: PrismaService, pdfService: PdfService, templateService: TemplatesService);
    create(userId: string, dto: CreateDocumentDto): Promise<{
        id: string;
        content: string;
        values: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        userId: string;
    }>;
    findAll(params: {
        page?: number;
        size?: number;
        initialDate?: Date;
        finalDate?: Date;
        userId?: string;
        templateId?: string;
    }): Promise<PaginatorTypes.PaginatedResult<unknown>>;
    findById(id: string): Promise<{
        id: string;
        content: string;
        values: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        userId: string;
    } | null>;
    delete(id: string): Promise<{
        id: string;
        content: string;
        values: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        userId: string;
    }>;
    generateDocument(id: string): Promise<Buffer>;
    replaceVariables(content: string, variables: {
        key: string;
        label: string;
        defaultValue: string;
    }[], values: Record<string, string>[]): string;
}
