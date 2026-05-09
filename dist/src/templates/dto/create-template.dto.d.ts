import { Prisma } from "@prisma/client";
export declare class CreateTemplateDto {
    name: string;
    content: string;
    variables?: Prisma.InputJsonValue;
}
