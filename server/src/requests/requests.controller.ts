import { Body, Controller, Get, Post, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AiService } from '../ai/ai.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRequestDto) {
    const saved = await this.requestsService.create(dto);

    // Fire-and-forget — respond 201 immediately, AI runs in background
    setImmediate(() => {
      this.aiService.enrichRequest(
        (saved as any)._id.toString(),
        saved.name,
        saved.email,
        saved.message,
      );
    });

    return { success: true, id: (saved as any)._id };
  }

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
  ) {
    return this.requestsService.findAll(+page, +limit, category);
  }
}