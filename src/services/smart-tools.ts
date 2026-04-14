/** smart-tools: img2img / inpaint / upscale / bgremove 공통 유틸 */

import { img2img, inpaintImage, upscaleImage, removeBackground, type GenerationParams } from "./novelai-api";

/** base64 → Uint8Array */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64.replace(/^data:[^;]+;base64,/, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Uint8Array → base64 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** ZIP에서 첫 번째 이미지 추출 (NovelAI 응답은 ZIP) */
export async function extractImageFromZip(zipBytes: Uint8Array): Promise<string> {
  // 간단한 ZIP 파싱: PK\x03\x04 로컬 파일 헤더 탐색
  // 실제 구현에서는 fflate 등 라이브러리 사용 권장
  const view = new DataView(zipBytes.buffer);
  let offset = 0;
  while (offset < zipBytes.length - 4) {
    const sig = view.getUint32(offset, true);
    if (sig === 0x04034b50) {
      // local file header
      const filenameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const dataStart = offset + 30 + filenameLen + extraLen;
      const imageBytes = zipBytes.slice(dataStart, dataStart + compressedSize);
      return uint8ArrayToBase64(imageBytes);
    }
    offset++;
  }
  throw new Error("ZIP에서 이미지를 추출할 수 없습니다.");
}

export async function runImg2Img(
  params: GenerationParams,
  imageBase64: string,
  strength: number
): Promise<string> {
  const zip = await img2img(params, imageBase64, strength);
  return extractImageFromZip(zip);
}

export async function runUpscale(
  imageBase64: string,
  width: number,
  height: number,
  scale: 2 | 4 = 4
): Promise<string> {
  const zip = await upscaleImage(imageBase64, width, height, scale);
  return extractImageFromZip(zip);
}

export async function runInpaint(
  params: GenerationParams,
  imageBase64: string,
  maskBase64: string,
  strength = 0.7
): Promise<string> {
  const zip = await inpaintImage(params, imageBase64, maskBase64, strength);
  return extractImageFromZip(zip);
}

export async function runRemoveBackground(imageBase64: string): Promise<string> {
  const result = await removeBackground(imageBase64);
  return uint8ArrayToBase64(result);
}

/** Canvas API로 모자이크 효과 적용 */
export function applyMosaic(
  canvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  blockSize = 12
): string {
  const ctx = canvas.getContext("2d");
  const maskCtx = maskCanvas.getContext("2d");
  if (!ctx || !maskCtx) throw new Error("Canvas context를 가져올 수 없습니다.");

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const maskData = maskCtx.getImageData(0, 0, width, height);

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      // 마스크 영역 확인
      const maskIdx = (y * width + x) * 4;
      if (maskData.data[maskIdx + 3] === 0) continue;

      // 블록 평균색 계산
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += imageData.data[idx];
          g += imageData.data[idx + 1];
          b += imageData.data[idx + 2];
          count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // 블록 채우기
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          imageData.data[idx] = r;
          imageData.data[idx + 1] = g;
          imageData.data[idx + 2] = b;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
