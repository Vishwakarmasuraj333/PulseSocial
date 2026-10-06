export function parseGeminiJsonResponse<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from Gemini API.");
  }

  let cleaned = rawText.trim();

  // Robustly strip Markdown code fences
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```[\s\S]*$/i, "")
    .trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 2. Extract balanced outer JSON object
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // 3. Relaxed cleanup for trailing commas and control chars
        try {
          const sanitized = candidate
            .replace(/,\s*([}\]])/g, "$1")
            .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "");
          return JSON.parse(sanitized) as T;
        } catch {
          // fall through
        }
      }
    }

    throw new Error(
      `Failed to parse Gemini structured JSON. Raw snippet: ${cleaned.slice(0, 160)}`
    );
  }
}

export function validateSocialCopyPayload(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (!data.primaryCaption || typeof data.primaryCaption !== "string") return false;
  return true;
}
