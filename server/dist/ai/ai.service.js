"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const request_schema_1 = require("../requests/schemas/request.schema");
const axios_1 = __importDefault(require("axios"));
let AiService = AiService_1 = class AiService {
    requestModel;
    logger = new common_1.Logger(AiService_1.name);
    constructor(requestModel) {
        this.requestModel = requestModel;
    }
    async enrichRequest(requestId, name, email, message) {
        const existing = await this.requestModel.findById(requestId).lean();
        if (!existing) {
            this.logger.warn(`enrichRequest called for unknown requestId ${requestId} — document not found in DB, skipping`);
            return;
        }
        try {
            const systemPrompt = `You are a support triage assistant for a SaaS company. 
Your job is to analyze incoming user requests and classify them.
You MUST respond ONLY with a valid JSON object — no explanation, no markdown, no code blocks.
The JSON must follow this exact shape:
{
  "category": "billing" | "support" | "feedback" | "general",
  "summary": "One concise sentence summarizing the request",
  "urgency": "low" | "medium" | "high"
}
Rules:
- category "billing" = payment, invoice, charge, subscription issues
- category "support" = bugs, errors, technical problems
- category "feedback" = suggestions, praise, complaints about features
- category "general" = anything else
- urgency "high" = blocking issue, financial loss, account locked
- urgency "medium" = degraded experience, workaround exists
- urgency "low" = question, suggestion, minor issue`;
            const userMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
            const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openrouter/free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            const rawContent = response.data.choices[0]?.message?.content || '';
            let parsed;
            try {
                const cleaned = rawContent.replace(/```json|```/g, '').trim();
                parsed = JSON.parse(cleaned);
            }
            catch {
                this.logger.warn(`Failed to parse AI response for ${requestId}: ${rawContent}`);
                return;
            }
            const validCategories = ['billing', 'support', 'feedback', 'general'];
            const validUrgencies = ['low', 'medium', 'high'];
            await this.requestModel.findByIdAndUpdate(requestId, {
                category: validCategories.includes(parsed.category)
                    ? parsed.category
                    : null,
                summary: typeof parsed.summary === 'string' ? parsed.summary : null,
                urgency: validUrgencies.includes(parsed.urgency)
                    ? parsed.urgency
                    : null,
            }, { new: true });
            this.logger.log(`Enriched request ${requestId} → ${parsed.category} / ${parsed.urgency}`);
        }
        catch (error) {
            const axiosErr = error;
            const status = axiosErr.response?.status ?? 'N/A';
            const detail = axiosErr.response?.data
                ? JSON.stringify(axiosErr.response.data)
                : axiosErr.message;
            this.logger.error(`AI enrichment failed for ${requestId} [HTTP ${status}]: ${detail}`);
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AiService);
//# sourceMappingURL=ai.service.js.map