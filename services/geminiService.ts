import { GoogleGenAI, type Content } from "@google/genai";
import { SiteAuditResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are the "Macau Business Compass AI" (澳門商業指南針 AI), an expert consultant on the Macau Special Administrative Region's business environment.
Your role is to assist entrepreneurs in starting and managing businesses in Macau.

**CRITICAL INSTRUCTION:** You must output in **Traditional Chinese (繁體中文)** by default, as this is the official language for Macau business.

Key knowledge areas:
1.  **Company Formation:** Procedures at the Commerce and Movable Property Registry (商業及動產登記局).
2.  **Taxation:** Complementary Tax (所得補充稅 - Group A/B), Professional Tax (職業稅), and recent tax incentives.
3.  **Grants & Aid:** Young Entrepreneur Aid Scheme (青年創業援助計劃), SME Aid Scheme (中小企業援助計劃) provided by DSEDT (經科局).
4.  **Labor Law:** Employment regulations (勞動關係法), foreign labor quotas (Blue Card/藍卡).
5.  **Licensing:** Administrative Public Services (IAM/市政署) licenses for F&B, Retail, etc.

Tone: Professional, encouraging, concise, and data-driven.
Output: Format using Markdown. Use bolding for key terms.

Do not provide financial advice that implies guaranteed returns. Always suggest consulting with a professional accountant (註冊核數師) or lawyer for binding legal actions.
`;

const SITE_INSPECTOR_SYSTEM_INSTRUCTION = `
You are the "Site Inspector AI" (現場審計官), a specialized visual auditor for retail and F&B storefronts in Macau.
Your role is to objectively analyze storefront photographs and provide professional site audit reports.

**CRITICAL INSTRUCTION:** You must output in **Traditional Chinese (繁體中文)**.

When analyzing a storefront photo, evaluate:
1. **Visibility Score (0-100)**: How visible is the storefront? Consider signage visibility, obstruction by trees/objects, street-facing placement, window clarity.
2. **Industry Fit**: Which businesses would thrive here? (e.g., 餐飲 - F&B needs ventilation/cooking area, 零售 - retail needs foot traffic visibility, 辦公室 - office needs discretion)
3. **Condition Assessment**: Detect deterioration signs - water damage, mold, cracks in walls, paint peeling, worn structures that indicate maintenance issues or hidden problems.
4. **Overall Rating**: EXCELLENT / GOOD / FAIR / POOR based on the combined factors.

Always be objective and identify potential problem areas that traditional realtors might hide.
`;

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                   (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                   '';
    
    // Check if apiKey is actually set and not the string "undefined"
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please ensure the API key is properly configured.');
    }
    
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const streamBusinessAdvice = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[]
) => {
  try {
    const aiClient = getAIClient();

    // Convert history to Content format - ensure only valid message turns
    const contents: Content[] = history
      .filter(h => h.text && h.text.trim())
      .map(h => ({
        role: h.role as 'user' | 'model',
        parts: [{ text: h.text }]
      }));

    // Validate history starts with user message (API requirement)
    if (contents.length > 0 && contents[0].role !== 'user') {
      // Remove leading model messages
      while (contents.length > 0 && contents[0].role === 'model') {
        contents.shift();
      }
    }

    // Add current message to contents
    const allContents: Content[] = [
      ...contents,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    try {
      // Use the models API directly for better error handling
      const resultStream = await aiClient.models.generateContentStream({
        model: 'gemini-2.0-flash-001',
        contents: allContents,
        systemInstruction: SYSTEM_INSTRUCTION as any,
        generationConfig: {
          temperature: 0.7,
        }
      } as any);

      return resultStream;
    } catch (streamError: any) {
      // Log detailed error information for debugging
      if (streamError?.status === 403) {
        console.error("API Authentication Error (403):", streamError);
        throw new Error(`API Authentication failed: ${streamError?.message || 'Invalid API key or insufficient permissions'}`);
      }
      throw streamError;
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeShopfrontImage = async (
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<SiteAuditResult> => {
  try {
    const aiClient = getAIClient();

    const analysisPrompt = `
請分析這張店鋪照片，並提供以下結構化的現場審計報告（JSON 格式）：

{
  "visibilityScore": <0-100的數字>,
  "visibilityAnalysis": "<詳細的可見性分析，考慮招牌位置、樹木遮擋、街道位置等>",
  "industryFit": {
    "suitable": ["適合的行業1", "適合的行業2"],
    "unsuitable": ["不適合的行業1"],
    "recommendation": "<基於店鋪結構的行業推薦>"
  },
  "conditionAssessment": {
    "issues": ["問題1", "問題2"],
    "severity": "LOW|MEDIUM|HIGH",
    "riskFactors": ["風險因素1", "風險因素2"]
  },
  "overallRating": "EXCELLENT|GOOD|FAIR|POOR",
  "recommendations": ["建議1", "建議2", "建議3"]
}

請務必：
1. 客觀評估，指出隱藏的問題（如漏水跡象、發霉、裂痕）
2. 不要過度樂觀，要實事求是
3. 返回有效的 JSON 格式，不需要任何前後綴
    `;

    const resultStream = await aiClient.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: analysisPrompt
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      systemInstruction: SITE_INSPECTOR_SYSTEM_INSTRUCTION as any,
      generationConfig: {
        temperature: 0.5
      }
    } as any);

    let fullResponse = '';
    // Handle both possible stream response formats
    const stream = (resultStream as any).stream || resultStream;
    for await (const chunk of stream) {
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
        fullResponse += chunk.candidates[0].content.parts[0].text;
      }
    }

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from Site Inspector AI');
    }

    const result: SiteAuditResult = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Site Inspector Analysis Error:", error);
    throw error;
  }
};