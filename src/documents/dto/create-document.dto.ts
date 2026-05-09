import { Prisma } from "@prisma/client";
import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateDocumentDto {
    @IsString()
    templateId: string;

    @IsOptional()
    @IsArray()
    values?: Prisma.InputJsonValue;
}
