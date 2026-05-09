import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PdfModule } from 'src/pdf/pdf.module';
import { TemplatesModule } from 'src/templates/templates.module';

@Module({
  imports: [PdfModule, TemplatesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule { }
