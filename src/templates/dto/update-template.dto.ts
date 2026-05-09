import { Prisma } from "@prisma/client";
import { IsArray, IsObject, IsOptional, IsString } from "class-validator";

export class UpdateTemplateDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsArray()
    variables?: Prisma.InputJsonValue;

    @IsOptional()
    @IsObject()
    pdfOptions?: Prisma.InputJsonValue;
}