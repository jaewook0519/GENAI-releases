/** Google Gemini API 서비스 (태그 분석, RP 프롬프트 AI 초안) */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getGeminiKey(): string {
  // settings-store에서 geminiApiKey 가져옴 (순환 참조 방지를 위해 직접 import 대신 동적으로)
  try {
    const raw = localStorage.getItem("genai-settings");
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { geminiApiKey?: string } };
      return parsed?.state?.geminiApiKey ?? "";
    }
  } catch {
    // ignore
  }
  return "";
}

export interface GeminiTextRequest {
  prompt: string;
  maxTokens?: number;
}

export async function generateText(req: GeminiTextRequest): Promise<string> {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API 키가 설정되지 않았습니다.");

  const response = await fetch(
    `${GEMINI_BASE}/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.prompt }] }],
        generationConfig: {
          maxOutputTokens: req.maxTokens ?? 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API 오류: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** 이미지에서 태그 추출 */
export async function analyzeImageTags(imageBase64: string): Promise<string[]> {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API 키가 설정되지 않았습니다.");

  const response = await fetch(
    `${GEMINI_BASE}/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this image and output a comma-separated list of Danbooru-style tags describing the image. Output only the tags, nothing else.",
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`태그 분석 실패: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
