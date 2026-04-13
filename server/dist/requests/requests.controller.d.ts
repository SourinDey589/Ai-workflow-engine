import { RequestsService } from './requests.service';
import { AiService } from '../ai/ai.service';
import { CreateRequestDto } from './dto/create-request.dto';
export declare class RequestsController {
    private readonly requestsService;
    private readonly aiService;
    constructor(requestsService: RequestsService, aiService: AiService);
    create(dto: CreateRequestDto): Promise<{
        success: boolean;
        id: any;
    }>;
    findAll(page?: string, limit?: string, category?: string): Promise<{
        data: import("./schemas/request.schema").Request[];
        total: number;
        page: number;
    }>;
}
