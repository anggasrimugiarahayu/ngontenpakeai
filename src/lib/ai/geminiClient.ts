import { GoogleGenAI } from "@google/genai";
import { getDefaultAiModel, getFallbackAiModel } from "@/lib/get-ai-model";

export interface GenerateStructuredAiOptions {
  apiKey: string;
  userPrompt: string;
  systemPrompt?: string;
  fallbackModelDefault?: string;
  responseMimeType?: "application/json" | "text/plain";
}

/**
 * Extracts and parses JSON safely from an LLM response string.
 * Strips markdown code blocks and matches enclosing brackets/braces.
 */
export function extractJsonFromResponse<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Respon AI kosong atau bukan teks yang valid.");
  }

  // 1. Clean markdown code fences if present
  let cleaned = rawText
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```$/m, "")
    .trim();

  // 2. Search for the outermost JSON object or array
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

  let targetJsonStr = cleaned;
  if (objectMatch && arrayMatch) {
    // Pick whichever appears first
    targetJsonStr =
      cleaned.indexOf(objectMatch[0]) <= cleaned.indexOf(arrayMatch[0])
        ? objectMatch[0]
        : arrayMatch[0];
  } else if (objectMatch) {
    targetJsonStr = objectMatch[0];
  } else if (arrayMatch) {
    targetJsonStr = arrayMatch[0];
  }

  try {
    return JSON.parse(targetJsonStr) as T;
  } catch (err: any) {
    console.error("Gagal melakukan parse JSON dari AI:", targetJsonStr);
    throw new Error(`Format JSON dari AI tidak valid: ${err?.message || "Syntax Error"}`);
  }
}

/**
 * Standardized AI Content Generator with Automatic Model Fallback on Server Overload
 */
export async function generateStructuredAiContent<T = any>(
  options: GenerateStructuredAiOptions
): Promise<T> {
  const {
    apiKey,
    userPrompt,
    systemPrompt,
    fallbackModelDefault = "gemini-2.5-flash",
    responseMimeType = "application/json",
  } = options;

  if (!apiKey) {
    throw new Error("API Key Google Gemini tidak ditemukan.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const defaultModel = await getDefaultAiModel(fallbackModelDefault);

  const requestConfig: any = {
    responseMimeType,
  };
  if (systemPrompt && systemPrompt.trim()) {
    requestConfig.systemInstruction = systemPrompt;
  }

  let response: any;
  try {
    response = await ai.models.generateContent({
      model: defaultModel,
      contents: userPrompt,
      config: requestConfig,
    });
  } catch (error: any) {
    const errStr = String(error?.message || "");
    const isOverloaded =
      error?.status === 503 ||
      error?.status >= 500 ||
      errStr.toLowerCase().includes("high demand") ||
      errStr.toLowerCase().includes("overloaded") ||
      errStr.toLowerCase().includes("resource exhausted") ||
      errStr.toLowerCase().includes("internal");

    if (isOverloaded) {
      console.warn(
        `[Fallback AI] Model ${defaultModel} sedang overloaded/limit. Mengalihkan ke fallback model...`
      );
      const fallbackModel = await getFallbackAiModel();
      response = await ai.models.generateContent({
        model: fallbackModel,
        contents: userPrompt,
        config: requestConfig,
      });
    } else {
      throw error;
    }
  }

  const rawText = response?.text;
  if (!rawText) {
    throw new Error("Respon kosong diterima dari layanan Google AI.");
  }

  if (responseMimeType === "application/json") {
    return extractJsonFromResponse<T>(rawText);
  }

  return rawText as unknown as T;
}
