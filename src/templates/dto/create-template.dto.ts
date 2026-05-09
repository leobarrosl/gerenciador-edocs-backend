import { IsArray, IsOptional, IsString } from "class-validator";
import { Prisma } from "@prisma/client";

export class CreateTemplateDto {
    @IsString()
    name!: string;

    @IsString()
    content!: string;

    @IsOptional()
    @IsArray()
    variables?: Prisma.InputJsonValue;
}