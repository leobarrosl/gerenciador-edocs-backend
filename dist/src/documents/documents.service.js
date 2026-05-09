"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nestjs_prisma_pagination_1 = require("@nodeteam/nestjs-prisma-pagination");
const client_1 = require("@prisma/client");
const pdf_service_1 = require("../pdf/pdf.service");
const templates_service_1 = require("../templates/templates.service");
let DocumentsService = class DocumentsService {
    prisma;
    pdfService;
    templateService;
    constructor(prisma, pdfService, templateService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.templateService = templateService;
    }
    async create(userId, dto) {
        const template = await this.templateService.findById(dto.templateId);
        if (!template) {
            throw new common_1.NotFoundException(`Template com ID ${dto.templateId} não encontrado`);
        }
        const content = this.replaceVariables(template.content, template.variables, dto.values);
        return await this.prisma.document.create({ data: { ...dto, content, userId } });
    }
    async findAll(params) {
        const { userId, templateId, page, size } = params;
        const paginate = (0, nestjs_prisma_pagination_1.paginator)({ perPage: size });
        return paginate(this.prisma.document, {
            where: {
                userId,
                templateId,
                createdAt: {
                    gte: params.initialDate,
                    lte: params.finalDate
                }
            },
            orderBy: { createdAt: 'desc' },
        }, { page, perPage: size });
    }
    async findById(id) {
        return this.prisma.document.findUnique({ where: { id } });
    }
    async delete(id) {
        try {
            return await this.prisma.document.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Documento com ID ${id} não encontrado`);
                }
            }
            throw error;
        }
    }
    async generateDocument(id) {
        const document = await this.findById(id);
        if (!document) {
            throw new common_1.NotFoundException(`Documento com ID ${id} não encontrado`);
        }
        const template = await this.templateService.findById(document.templateId);
        if (!template) {
            throw new common_1.NotFoundException(`Template com ID ${document.templateId} não encontrado`);
        }
        const pdfOptions = template.pdfOptions ?? undefined;
        return this.pdfService.generatePdfFromHtml(document.content, pdfOptions);
    }
    replaceVariables(content, variables, values) {
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        templates_service_1.TemplatesService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map