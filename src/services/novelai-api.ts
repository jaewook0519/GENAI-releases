import { useAuthStore } from "@/stores/auth-store";

const BASE_URL = "https://image.novelai.net";

export type NovelAIModel =
  | "nai-diffusion-4-5"
  | "nai-diffusion-4-5-curated"
  | "nai-diffusion-4"
  | "nai-diffusion-4-curated-preview"
  | "nai-diffusion-3"
  | "nai-diffusion-3-inpainting";

export type Sampler =
  | "k_euler"
  | "k_euler_ancestral"
  | "k_dpmpp_2s_ancestral"
  | "k_dpmpp_2m"
  | "k_dpmpp_sde"
  | "ddim_v3";

export interface GenerationParams {
  model: NovelAIModel;
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  sampler: Sampler;
  seed: number;
  noiseSchedule: string;
  qualityToggle: boolean;
  smea: boolean;
  smeaDyn: boolean;
}

class NovelAIAPIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "NovelAIAPIError";
  }
}

function getAuthHeaders(): HeadersInit {
  const { token } = useAuthStore.getState();
  if (!token) throw new NovelAIAPIError(401, "NovelAI 토큰이 설정되지 않았습니다.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** 이미지 생성 (단일) — Uint8Array (zip) 반환 */
export async function generateImage(
  params: GenerationParams,
  signal?: AbortSignal
): Promise<Uint8Array> {
  const response = await fetch(`${BASE_URL}/ai/generate-image`, {
    method: "POST",
    headers: getAuthHeaders(),
    signal,
    body: JSON.stringify({
      input: params.prompt,
      model: params.model,
      action: "generate",
      parameters: {
        width: params.width,
        height: params.height,
        scale: params.cfgScale,
        sampler: params.sampler,
        steps: params.steps,
        seed: params.seed,
        n_samples: 1,
        negative_prompt: params.negativePrompt,
        ucPreset: params.qualityToggle ? 0 : 3,
        qualityToggle: params.qualityToggle,
        sm: params.smea,
        sm_dyn: params.smeaDyn,
        noise_schedule: params.noiseSchedule,
      },
    }),
  });

  if (!response.ok) {
    throw new NovelAIAPIError(response.status, `생성 실패: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

/** img2img */
export async function img2img(
  params: GenerationParams,
  imageBase64: string,
  strength: number
): Promise<Uint8Array> {
  const response = await fetch(`${BASE_URL}/ai/generate-image`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      input: params.prompt,
      model: params.model,
      action: "img2img",
      parameters: {
        width: params.width,
        height: params.height,
        scale: params.cfgScale,
        sampler: params.sampler,
        steps: params.steps,
        seed: params.seed,
        negative_prompt: params.negativePrompt,
        image: imageBase64,
        strength,
        noise: 0,
      },
    }),
  });

  if (!response.ok) {
    throw new NovelAIAPIError(response.status, `img2img 실패: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** 4K 업스케일 */
export async function upscaleImage(
  imageBase64: string,
  width: number,
  height: number,
  scale: 2 | 4 = 4
): Promise<Uint8Array> {
  const response = await fetch(`${BASE_URL}/ai/upscale`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      image: imageBase64,
      width: width * scale,
      height: height * scale,
      scale,
    }),
  });

  if (!response.ok) {
    throw new NovelAIAPIError(response.status, `업스케일 실패: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** 인페인팅 */
export async function inpaintImage(
  params: GenerationParams,
  imageBase64: string,
  maskBase64: string,
  strength: number = 0.7
): Promise<Uint8Array> {
  const response = await fetch(`${BASE_URL}/ai/generate-image`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      input: params.prompt,
      model: params.model,
      action: "infill",
      parameters: {
        width: params.width,
        height: params.height,
        scale: params.cfgScale,
        sampler: params.sampler,
        steps: params.steps,
        seed: params.seed,
        negative_prompt: params.negativePrompt,
        image: imageBase64,
        mask: maskBase64,
        strength,
        noise: 0,
      },
    }),
  });

  if (!response.ok) {
    throw new NovelAIAPIError(response.status, `인페인팅 실패: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** 배경 제거 */
export async function removeBackground(imageBase64: string): Promise<Uint8Array> {
  const response = await fetch(`${BASE_URL}/ai/remove-background`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    throw new NovelAIAPIError(response.status, `배경 제거 실패: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export { NovelAIAPIError };
