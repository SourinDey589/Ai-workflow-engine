import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from '../requests/schemas/request.schema';
import axios, { AxiosError } from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) {}

  async enrichRequest(
    requestId: string,
    name: string,
    email: string,
    message: string,
  ): Promise<void> {
    
    
    
   
    const existing = await this.requestModel.findById(requestId).lean();
    if (!existing) {
      this.logger.warn(
        `enrichRequest called for unknown requestId ${requestId} — document not found in DB, skipping`,
      );
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

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          
          
          model: 'openrouter/free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const rawContent = response.data.choices[0]?.message?.content || '';
      let parsed: { category: string; summary: string; urgency: string };

      try {
        // Strip markdown code blocks if model wraps response
        const cleaned = rawContent.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        this.logger.warn(
          `Failed to parse AI response for ${requestId}: ${rawContent}`,
        );
        return; // Leave fields as null
      }

      const validCategories = ['billing', 'support', 'feedback', 'general'];
      const validUrgencies = ['low', 'medium', 'high'];

      
      
      
      await this.requestModel.findByIdAndUpdate(
        requestId,
        {
          category: validCategories.includes(parsed.category)
            ? parsed.category
            : null,
          summary: typeof parsed.summary === 'string' ? parsed.summary : null,
          urgency: validUrgencies.includes(parsed.urgency)
            ? parsed.urgency
            : null,
        },
        { new: true },
      );

      this.logger.log(
        `Enriched request ${requestId} → ${parsed.category} / ${parsed.urgency}`,
      );
    } catch (error) {
      
      
      
      // see the real cause (capacity limit, auth failure, unknown route, etc.).
      const axiosErr = error as AxiosError;
      const status = axiosErr.response?.status ?? 'N/A';
      const detail = axiosErr.response?.data
        ? JSON.stringify(axiosErr.response.data)
        : axiosErr.message;

      this.logger.error(
        `AI enrichment failed for ${requestId} [HTTP ${status}]: ${detail}`,
      );
      
    }
  }
}