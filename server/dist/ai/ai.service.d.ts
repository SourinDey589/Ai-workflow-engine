import { Model } from 'mongoose';
import { Request } from '../requests/schemas/request.schema';
export declare class AiService {
    private requestModel;
    private readonly logger;
    constructor(requestModel: Model<Request>);
    enrichRequest(requestId: string, name: string, email: string, message: string): Promise<void>;
}
