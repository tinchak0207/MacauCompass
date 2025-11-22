import { GoogleGenAI, type Content } from "@google/genai";

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
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.7,
        }
      });

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