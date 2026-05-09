import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";
import { Prisma } from "@prisma/client";
import { paginator, PaginatorTypes } from "@nodeteam/nestjs-prisma-pagination";

@Injectable()
export class TemplatesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateTemplateDto) {
        return await this.prisma.template.create({ data: { ...dto, userId } });
    }

    async update(id: string, dto: UpdateTemplateDto) {
        try {
            return await this.prisma.template.update({ where: { id }, data: dto });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Template com ID ${id} não encontrado`);
                }
            }
            throw error;
        }
    }

    async findAll(params: {
        page?: number,
        size?: number,
        search?: string;
        userId?: string
    }) {
        const { search, userId, page, size } = params;
        const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: size });
        return paginate(
            this.prisma.template,
            {
                where: {
                    userId,
                    name: search ? { contains: search, mode: 'insensitive' } : undefined,
                },
                orderBy: { createdAt: 'desc' },
            },
            { page, perPage: size },
        );
    }

    async findById(id: string) {
        return this.prisma.template.findUnique({ where: { id } });
    }

    async delete(id: string) {
        try {
            await this.prisma.template.delete({ where: { id } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Template com ID ${id} não encontrado`);
                }
            }
            throw error;
        }
    }
}