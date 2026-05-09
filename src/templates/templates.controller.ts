import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UpdateTemplateDto } from "./dto/update-template.dto";

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.templatesService.findById(id);
    }

    @Get()
    findAll(@Query() params: {
        page?: number,
        size?: number,
        search?: string;
        userId?: string;
    }) {
        return this.templatesService.findAll(params);
    }

    @Post()
    create(@Body() dto: CreateTemplateDto, @Request() req) {
        return this.templatesService.create(req.user.id, dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
        return this.templatesService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.templatesService.delete(id);
    }

}