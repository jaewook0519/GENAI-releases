/** LLM RP 서비스 — Gemini API 연동 (선택적 구현 예정) */

/**
 * 캐릭터 이름/컨셉으로 description/personality 초안 생성
 * (추후 gemini-service.ts 연동으로 구현)
 */
export async function generateCharacterDraft(
  _name: string,
  _concept: string
): Promise<{ description: string; personality: string }> {
  throw new Error("Gemini API 키가 필요합니다. 설정에서 Gemini API 키를 입력해주세요.");
}
