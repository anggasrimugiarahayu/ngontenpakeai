import { GoogleGenAI } from "@google/genai";
import { getDefaultAiModel, getFallbackAiModel } from "@/lib/get-ai-model";
import { getApiKey, getGroqApiKey } from "@/lib/get-api-key";

export interface GenerateStructuredAiOptions {
  apiKey?: string;
  groqApiKey?: string;
  userPrompt: string;
  systemPrompt?: string;
  model?: string;
  fallbackModelDefault?: string;
  responseMimeType?: "application/json" | "text/plain";
  temperature?: number;
}

export function isGroqModel(modelId?: string | null): boolean {
  if (!modelId) return false;
  const lower = modelId.toLowerCase();
  return (
    lower.startsWith("llama") ||
    lower.startsWith("qwen") ||
    lower.startsWith("allam") ||
    lower.startsWith("openai/gpt-oss") ||
    lower.startsWith("canopylabs") ||
    lower.includes("groq")
  );
}

export function resolveGroqModel(modelId: string): string {
  const lower = modelId.toLowerCase();
  if (lower.includes("llama-3.3") || lower.includes("70b")) {
    return "qwen/qwen3.8-27b";
  }
  if (lower.includes("llama-3.1") || lower.includes("8b")) {
    return "llama-3.1-8b-instant";
  }
  if (lower.includes("20b") || lower.includes("120b") || lower.includes("openai")) {
    return "openai/gpt-oss-120b";
  }
  return modelId;
}

export async function callGroqChatCompletion(options: {
  apiKey: string;
  model: string;
  userPrompt: string;
  systemPrompt?: string;
  responseMimeType?: "application/json" | "text/plain";
  temperature?: number;
}): Promise<string> {
  const { apiKey, model, userPrompt, systemPrompt, responseMimeType, temperature = 0.7 } = options;
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({ role: "system", content: systemPrompt.trim() });
  }
  messages.push({ role: "user", content: userPrompt });

  const resolvedModel = resolveGroqModel(model || "qwen/qwen3.8-27b");
  const body: any = {
    model: resolvedModel,
    messages,
    temperature,
  };

  if (responseMimeType === "application/json") {
    body.response_format = { type: "json_object" };
    const hasJsonWord = messages.some((m) => m.content.toLowerCase().includes("json"));
    if (!hasJsonWord) {
      messages[messages.length - 1].content += "\n\nRespond with a valid JSON object.";
    }
  }

  let res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Auto-failover to alternative healthy Groq models if primary model is 404, 503 (high demand), or 429
  if (!res.ok && (res.status === 404 || res.status === 503 || res.status === 429)) {
    const fallbackList = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"].filter(
      (m) => m !== body.model
    );
    for (const altModel of fallbackList) {
      body.model = altModel;
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) break;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || `Groq API error (${res.status})`;
    const err = new Error(message) as any;
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Respon kosong diterima dari layanan Groq AI.");
  }
  return content;
}

export async function callGoogleGeminiContent(options: {
  apiKey: string;
  model: string;
  userPrompt: string;
  systemPrompt?: string;
  responseMimeType?: "application/json" | "text/plain";
}): Promise<string> {
  const { apiKey, model, userPrompt, systemPrompt, responseMimeType } = options;
  const ai = new GoogleGenAI({ apiKey });
  const requestConfig: any = {
    responseMimeType: responseMimeType || "application/json",
  };
  if (systemPrompt && systemPrompt.trim()) {
    requestConfig.systemInstruction = systemPrompt;
  }
  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: requestConfig,
  });
  const text = response?.text;
  if (!text) {
    throw new Error("Respon kosong diterima dari layanan Google AI.");
  }
  return text;
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
    // Resilient Fallback: Auto-repair invalid escapes, single quotes, and control chars
    try {
      let repaired = targetJsonStr
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
        .replace(/\\'/g, "'")
        .replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\")
        .replace(/,\s*([\]}])/g, "$1");
      return JSON.parse(repaired) as T;
    } catch (secondErr: any) {
      console.error("Gagal melakukan parse JSON dari AI:", targetJsonStr);
      throw new Error(`Format JSON dari AI tidak valid: ${err?.message || "Syntax Error"}`);
    }
  }
}

/**
 * Standardized AI Content Generator with Automatic Model Routing and Fallback
 */
export async function generateStructuredAiContent<T = any>(
  options: GenerateStructuredAiOptions
): Promise<T> {
  const {
    apiKey,
    groqApiKey,
    userPrompt,
    systemPrompt,
    model,
    fallbackModelDefault,
    responseMimeType = "application/json",
    temperature = 0.7,
  } = options;

  const defaultModelFromDb = await getDefaultAiModel("llama-3.3-70b-versatile");
  const targetModel = model || defaultModelFromDb || fallbackModelDefault || "llama-3.3-70b-versatile";

  let rawText: string | null = null;
  const targetIsGroq = isGroqModel(targetModel);

  // 1. Attempt Primary Path
  if (targetIsGroq) {
    const activeGroqKey = await getGroqApiKey(groqApiKey);
    if (activeGroqKey) {
      try {
        rawText = await callGroqChatCompletion({
          apiKey: activeGroqKey,
          model: targetModel,
          userPrompt,
          systemPrompt,
          responseMimeType,
          temperature,
        });
      } catch (groqErr: any) {
        console.warn(
          `[Universal AI] Groq model ${targetModel} gagal: ${groqErr?.message || groqErr}. Mengalihkan ke fallback model...`
        );
      }
    }
  } else {
    const activeGeminiKey = await getApiKey(apiKey);
    if (activeGeminiKey) {
      try {
        rawText = await callGoogleGeminiContent({
          apiKey: activeGeminiKey,
          model: targetModel,
          userPrompt,
          systemPrompt,
          responseMimeType,
        });
      } catch (geminiErr: any) {
        console.warn(
          `[Universal AI] Gemini model ${targetModel} gagal: ${geminiErr?.message || geminiErr}. Mengalihkan ke fallback model...`
        );
      }
    }
  }

  // 2. Attempt Fallback Path if Primary Failed or was Unavailable
  if (!rawText) {
    const fallbackModel = await getFallbackAiModel("gemini-3.5-flash-lite");
    const fallbackIsGroq = isGroqModel(fallbackModel);

    if (fallbackIsGroq) {
      const activeGroqKey = await getGroqApiKey(groqApiKey);
      if (!activeGroqKey) {
        throw new Error("Kunci Groq API tidak ditemukan untuk fallback model.");
      }
      rawText = await callGroqChatCompletion({
        apiKey: activeGroqKey,
        model: fallbackModel,
        userPrompt,
        systemPrompt,
        responseMimeType,
        temperature,
      });
    } else {
      const activeGeminiKey = await getApiKey(apiKey);
      if (!activeGeminiKey) {
        throw new Error("Kunci Google API tidak ditemukan untuk fallback model.");
      }
      rawText = await callGoogleGeminiContent({
        apiKey: activeGeminiKey,
        model: fallbackModel,
        userPrompt,
        systemPrompt,
        responseMimeType,
      });
    }
  }

  if (!rawText) {
    throw new Error("Respon kosong diterima dari layanan AI.");
  }

  if (responseMimeType === "application/json") {
    return extractJsonFromResponse<T>(rawText);
  }

  return rawText as unknown as T;
}
