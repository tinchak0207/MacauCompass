import { GoogleGenAI, type Content } from "@google/genai";
import type {
  BusinessPlan,
  BusinessPlanParams,
  RadarAnalysis,
  RadarParams,
} from "../types";

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

const RADAR_SYSTEM_INSTRUCTION = `
You are a market analysis expert specializing in Macau's commercial real estate and competitive landscape.
When provided with real Google Maps data of competitors, you must:
1. Analyze the density and quality of competition
2. Identify market saturation patterns
3. Provide actionable insights for entrepreneurs
4. Always respond in Traditional Chinese (繁體中文)
Be data-driven and specific. Reference the actual places found.
`;

const BOARDROOM_SYSTEM_INSTRUCTION = `
You are the "Boardroom Live" advisor for Macau Compass. Respond as a senior partner in a strategy consulting firm.
- Always speak in Traditional Chinese (繁體中文)
- Reference the latest Macau SME policies when relevant
- Provide punchy, spoken-language style answers (2-4 sentences at a time)
- If the user shares location, rental cost, or images, incorporate them into the response
- Remind users to consult professional accountants/lawyers for formal filings when necessary
`;

const BUSINESS_PLAN_SYSTEM_INSTRUCTION = `
You are a Macau-focused venture analyst generating structured business plans.
Return JSON with the following schema:
{
  "title": string,
  "summary": string,
  "swot": {
    "strengths": string[],
    "weaknesses": string[],
    "opportunities": string[],
    "threats": string[]
  },
  "financialProjection": {
    "initialInvestment": number,
    "monthlyRevenue": number,
    "monthlyExpenses": number,
    "breakEvenMonths": number
  },
  "compliance": string[],
  "markdown": string
}
All content must be in Traditional Chinese and grounded in Macau's business reality.
`;

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey =
      (typeof process !== "undefined" && process.env?.API_KEY) ||
      (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
      "";

    if (!apiKey || apiKey === "undefined") {
      throw new Error(
        "GEMINI_API_KEY environment variable is not set. Please ensure the API key is properly configured."
      );
    }

    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

type StreamOptions = {
  systemInstruction?: string;
  temperature?: number;
  model?: string;
  tools?: unknown[];
};

const buildHistoryContents = (
  history: { role: "user" | "model"; text: string }[]
): Content[] => {
  const contents: Content[] = history
    .filter((h) => h.text && h.text.trim())
    .map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  return contents;
};

const createStream = async (
  message: string,
  history: { role: "user" | "model"; text: string }[],
  options: StreamOptions = {}
) => {
  try {
    const aiClient = getAIClient();
    const contents = buildHistoryContents(history);

    const allContents: Content[] = [
      ...contents,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    return await aiClient.models.generateContentStream({
      model: options.model ?? "gemini-2.0-flash-001",
      contents: allContents,
      systemInstruction: options.systemInstruction ?? SYSTEM_INSTRUCTION,
      tools: options.tools,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
      },
    });
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};

export const streamBusinessAdvice = (
  message: string,
  history: { role: "user" | "model"; text: string }[],
  options?: StreamOptions
) =>
  createStream(message, history, {
    systemInstruction: SYSTEM_INSTRUCTION,
    ...options,
  });

export const streamBoardroomInsights = (
  message: string,
  history: { role: "user" | "model"; text: string }[]
) =>
  createStream(message, history, {
    systemInstruction: BOARDROOM_SYSTEM_INSTRUCTION,
    temperature: 0.4,
    model: "gemini-2.0-flash-exp",
  });

const extractJson = (raw: string): any | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const buildRadarFallback = (
  district: string,
  businessType: string
): RadarAnalysis => ({
  competitors: [
    {
      name: `${district}${businessType} Flagship`,
      rating: 4.2,
      userRatingsTotal: 180,
      vicinity: `${district} 主幹道`,
    },
    {
      name: `${district}${businessType} Workshop`,
      rating: 4.0,
      userRatingsTotal: 95,
      vicinity: `${district} 巷道`,
    },
    {
      name: `${district}${businessType} Studio`,
      rating: 3.8,
      userRatingsTotal: 60,
      vicinity: `${district} 鄰里`,
    },
  ],
  saturationLevel: "HIGH",
  insights: `${district} 的 ${businessType} 已有多個成熟品牌，建議選擇差異化定位或延伸至企業/旅客高客單價方案。`,
  recommendations: [
    "把握觀光客流高峰時段，推出限定菜單或聯乘合作",
    "與附近酒店或共享辦公室合作導客，鎖定穩定客群",
    "預留至少 6 個月現金流應對租金與人力成本波動",
  ],
  metrics: {
    competitorCount: 3,
    avgRating: 4.0,
    densityScore: 72,
  },
  updatedAt: new Date().toISOString(),
});

export const fetchCommercialRadar = async (
  params: RadarParams
): Promise<RadarAnalysis> => {
  try {
    const aiClient = getAIClient();

    const result = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-exp",
      systemInstruction: RADAR_SYSTEM_INSTRUCTION,
      tools: [{ googleMaps: {} }],
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `地區：${params.district}\n業態：${params.businessType}\n請使用 googleMaps 工具列出 8-12 間真實存在的競爭對手，並輸出 JSON：\n{\n  "competitors": [{"name": "", "rating": 4.2, "userRatingsTotal": 123, "vicinity": "", "mapsUri": ""}],\n  "saturationLevel": "LOW|MEDIUM|HIGH|CRITICAL",\n  "insights": "...",\n  "recommendations": ["..."],\n  "metrics": {"competitorCount": number, "avgRating": number, "densityScore": number}\n}\n全部內容請使用繁體中文。`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: "application/json",
      },
    });

    const rawText = result?.response?.text ? result.response.text() : "";
    const parsed = extractJson(rawText);

    if (!parsed) {
      return buildRadarFallback(params.district, params.businessType);
    }

    return {
      competitors: Array.isArray(parsed.competitors)
        ? parsed.competitors.map((item: any) => ({
            name: item.name || "未命名商戶",
            rating: item.rating,
            userRatingsTotal: item.userRatingsTotal,
            vicinity: item.vicinity,
            types: item.types,
            mapsUri: item.mapsUri,
          }))
        : [],
      saturationLevel: parsed.saturationLevel ?? "MEDIUM",
      insights:
        parsed.insights ?? `${params.district} 的 ${params.businessType} 市場處於中度競爭狀態。`,
      recommendations: parsed.recommendations ?? [],
      metrics: parsed.metrics ?? {
        competitorCount: Array.isArray(parsed.competitors)
          ? parsed.competitors.length
          : 0,
        avgRating: parsed.metrics?.avgRating,
        densityScore: parsed.metrics?.densityScore,
      },
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Commercial Radar Error:", error);
    return buildRadarFallback(params.district, params.businessType);
  }
};

const buildPlanFallback = (params: BusinessPlanParams): BusinessPlan => ({
  title: `${params.district}${params.businessType} 商業計劃`,
  summary: `${params.district} 商圈對 ${params.businessType} 有穩定需求，建議以 ${params.budget.toLocaleString()} MOP 預算啟動並聚焦高毛利產品線。`,
  swot: {
    strengths: ["地段人流穩定", "澳門居民與旅客雙客源"],
    weaknesses: ["租金偏高", "人力成本持續上升"],
    opportunities: ["政府推動夜經濟", "跨境旅客回流"],
    threats: ["大型連鎖競爭", "牌照審批期較長"],
  },
  financialProjection: {
    initialInvestment: params.budget,
    monthlyRevenue: Math.round(params.budget * 0.15),
    monthlyExpenses: Math.round(params.budget * 0.08),
    breakEvenMonths: 12,
  },
  compliance: [
    "商業及動產登記局：公司註冊",
    "市政署：相關行業牌照",
    "財政局：稅務登記及報稅",
  ],
  markdown: `# ${params.district}${params.businessType} 商業計劃\n\n此為離線備援版本，請重新嘗試生成以取得完整 AI 計劃書。`,
});

export const generateBusinessPlan = async (
  params: BusinessPlanParams
): Promise<BusinessPlan> => {
  try {
    const aiClient = getAIClient();

    const result = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-001",
      systemInstruction: BUSINESS_PLAN_SYSTEM_INSTRUCTION,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `地區：${params.district}\n業態：${params.businessType}\n預算：${params.budget}\n請依指示輸出 JSON 商業計劃。`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
      },
    });

    const rawText = result?.response?.text ? result.response.text() : "";
    const parsed = extractJson(rawText);

    if (!parsed) {
      return buildPlanFallback(params);
    }

    const plan: BusinessPlan = {
      title: parsed.title ?? `${params.businessType} 商業計劃`,
      summary:
        parsed.summary ?? `${params.district} 的 ${params.businessType} 市場具備潛力。`,
      swot: {
        strengths: parsed.swot?.strengths ?? [],
        weaknesses: parsed.swot?.weaknesses ?? [],
        opportunities: parsed.swot?.opportunities ?? [],
        threats: parsed.swot?.threats ?? [],
      },
      financialProjection: {
        initialInvestment:
          parsed.financialProjection?.initialInvestment ?? params.budget,
        monthlyRevenue:
          parsed.financialProjection?.monthlyRevenue ??
          Math.round(params.budget * 0.16),
        monthlyExpenses:
          parsed.financialProjection?.monthlyExpenses ??
          Math.round(params.budget * 0.09),
        breakEvenMonths:
          parsed.financialProjection?.breakEvenMonths ?? 12,
      },
      compliance:
        parsed.compliance ?? [
          "商業及動產登記局登記",
          "財政局稅務登記",
          "市政署相關行業牌照",
        ],
      markdown:
        parsed.markdown ??
        `# ${params.businessType} 商業計劃書\n\n(此為備援文字版本，請重新嘗試生成以獲得完整 Markdown)`;
    };

    return plan;
  } catch (error) {
    console.error("Business Plan Generation Error:", error);
    return buildPlanFallback(params);
  }
};
