import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) {}

  async create(dto: CreateRequestDto): Promise<Request> {
    const created = new this.requestModel(dto);
    return created.save();
  }

  async findAll(page = 1, limit = 10, category?: string): Promise<{ data: Request[]; total: number; page: number }> {
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.requestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return { data, total, page };
  }
}