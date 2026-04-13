import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Request, RequestSchema } from '../requests/schemas/request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}