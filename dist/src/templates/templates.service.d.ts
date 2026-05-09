import { PrismaService } from "../prisma/prisma.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import { Prisma } from "@prisma/client";
import { PaginatorTypes } from "@nodeteam/nestjs-prisma-pagination";
export declare class TemplatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTemplateDto): Promise<{
        name: string;
        content: string;
        variables: Prisma.JsonValue | null;
        pdfOptions: Prisma.JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, dto: UpdateTemplateDto): Promise<{
        name: string;
        content: string;
        variables: Prisma.JsonValue | null;
        pdfOptions: Prisma.JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAll(params: {
        page?: number;
        size?: number;
        search?: string;
        userId?: string;
    }): Promise<PaginatorTypes.PaginatedResult<unknown>>;
    findById(id: string): Promise<{
        name: string;
        content: string;
        variables: Prisma.JsonValue | null;
        pdfOptions: Prisma.JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null>;
    delete(id: string): Promise<void>;
}
