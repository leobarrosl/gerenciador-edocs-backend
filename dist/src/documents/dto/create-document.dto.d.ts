import { Prisma } from "@prisma/client";
export declare class CreateDocumentDto {
    templateId: string;
    values?: Prisma.InputJsonValue;
}
