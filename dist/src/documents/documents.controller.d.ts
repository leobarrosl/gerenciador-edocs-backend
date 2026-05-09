import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import type { Response } from 'express';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(createDocumentDto: CreateDocumentDto, req: any): Promise<{
        id: string;
        content: string;
        values: import("@prisma/client/runtime/client").JsonValue | null;
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
    }): Promise<import("@nodeteam/nestjs-prisma-pagination").PaginatorTypes.PaginatedResult<unknown>>;
    generate(id: string, res: Response): Promise<void>;
    findOne(id: string): Promise<{
        id: string;
        content: string;
        values: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        userId: string;
    } | null>;
    remove(id: string): Promise<{
        id: string;
        content: string;
        values: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        userId: string;
    }>;
}
