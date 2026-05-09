import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query, Res } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    return this.documentsService.create(req.user.id, createDocumentDto);
  }

  @Get()
  findAll(@Query() params: {
    page?: number,
    size?: number,
    initialDate?: Date,
    finalDate?: Date,
    userId?: string;
  }) {
    return this.documentsService.findAll(params);
  }

  @Get('generate/:id')
  async generate(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.documentsService.generateDocument(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="documento-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}
