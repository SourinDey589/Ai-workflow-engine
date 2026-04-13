import { Model } from 'mongoose';
import { Request } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
export declare class RequestsService {
    private requestModel;
    constructor(requestModel: Model<Request>);
    create(dto: CreateRequestDto): Promise<Request>;
    findAll(page?: number, limit?: number, category?: string): Promise<{
        data: Request[];
        total: number;
        page: number;
    }>;
}
