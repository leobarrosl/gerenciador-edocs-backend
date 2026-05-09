import { TemplatesService } from "./templates.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findById(id: string): Promise<{
        name: string;
        content: string;
        variables: import("@prisma/client/runtime/client").JsonValue | null;
        pdfOptions: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null>;
    findAll(params: {
        page?: number;
        size?: number;
        search?: string;
        userId?: string;
    }): Promise<import("@nodeteam/nestjs-prisma-pagination").PaginatorTypes.PaginatedResult<unknown>>;
    create(dto: CreateTemplateDto, req: any): Promise<{
        name: string;
        content: string;
        variables: import("@prisma/client/runtime/client").JsonValue | null;
        pdfOptions: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, dto: UpdateTemplateDto): Promise<{
        name: string;
        content: string;
        variables: import("@prisma/client/runtime/client").JsonValue | null;
        pdfOptions: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    delete(id: string): Promise<void>;
}
