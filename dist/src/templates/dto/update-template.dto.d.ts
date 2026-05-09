import { Prisma } from "@prisma/client";
export declare class UpdateTemplateDto {
    name?: string;
    content?: string;
    variables?: Prisma.InputJsonValue;
    pdfOptions?: Prisma.InputJsonValue;
}
