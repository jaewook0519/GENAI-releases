import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useToolsStore, type ToolType } from "@/stores/tools-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useLibraryStore } from "@/stores/library-store";
import { runImg2Img, runInpaint, runUpscale, runRemoveBackground, applyMosaic } from "@/services/smart-tools";
import CanvasMaskEditor from "@/components/tools/CanvasMaskEditor";
import ImageDropZone from "@/components/tools/ImageDropZone";
import ResultPanel from "@/components/tools/ResultPanel";
import { SpinnerIcon } from "@/components/ui/icons";

// ─── 탭 정의 ─────────────────────────────────────────────────────────────────

const TOOLS: { id: ToolType; label: string }[] = [
  { id: "img2img", label: "Img2Img" },
  { id: "upscale", label: "업스케일" },
  { id: "bgremove", label: "배경 제거" },
  { id: "inpaint", label: "인페인팅" },
  { id: "mosaic", label: "모자이크" },
  { id: "taganalysis", label: "태그 분석" },
];

// ─── Img2Img 도구 ─────────────────────────────────────────────────────────────

function Img2ImgTool() {
  const { inputBase64, outputBase64, isProcessing, error, strength, setInputBase64, setOutputBase64, setProcessing, setError, setStrength } = useToolsStore();
  const settings = useSettingsStore();
  const { addImage } = useLibraryStore();

  const handleRun = async () => {
    if (!inputBase64) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await runImg2Img(
        {
          model: settings.model,
          prompt: settings.prompt,
          negativePrompt: settings.negativePrompt,
          width: settings.width,
          height: settings.height,
          steps: settings.steps,
          cfgScale: settings.cfgScale,
          sampler: settings.sampler,
          seed: Math.floor(Math.random() * 4_294_967_295),
          noiseSchedule: settings.noiseSchedule,
          qualityToggle: settings.qualityToggle,
          smea: settings.smea,
          smeaDyn: settings.smeaDyn,
        },
        inputBase64,
        strength
      );
      setOutputBase64(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리 실패");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!outputBase64) return;
    addImage({
      base64: outputBase64,
      params: {
        model: settings.model,
        prompt: settings.prompt,
        negativePrompt: settings.negativePrompt,
        width: settings.width,
        height: settings.height,
        steps: settings.steps,
        cfgScale: settings.cfgScale,
        sampler: settings.sampler,
        seed: 0,
        noiseSchedule: settings.noiseSchedule,
        qualityToggle: settings.qualityToggle,
        smea: settings.smea,
        smeaDyn: settings.smeaDyn,
      },
      tool: "img2img",
    });
  };

  return (
    <div className="flex gap-4">
      <div className="flex w-64 shrink-0 flex-col gap-3">
        <ImageDropZone base64={inputBase64} onLoad={setInputBase64} label="원본 이미지" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">강도 (Strength)</span>
            <span className="text-foreground">{strength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.99}
            step={0.01}
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-primary"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          현재 왼쪽 패널의 프롬프트 · 파라미터가 적용됩니다.
        </p>
        <Button onClick={handleRun} disabled={!inputBase64 || isProcessing} className="w-full">
          {isProcessing ? <><SpinnerIcon /> 처리 중...</> : "실행"}
        </Button>
      </div>
      <div className="flex-1">
        <ResultPanel base64={outputBase64} isProcessing={isProcessing} error={error} onSaveToLibrary={handleSaveToLibrary} tool="img2img" />
      </div>
    </div>
  );
}

// ─── 업스케일 도구 ────────────────────────────────────────────────────────────

function UpscaleTool() {
  const { inputBase64, outputBase64, isProcessing, error, upscaleScale, setInputBase64, setOutputBase64, setProcessing, setError, setUpscaleScale } = useToolsStore();
  const settings = useSettingsStore();
  const { addImage } = useLibraryStore();

  const handleRun = async () => {
    if (!inputBase64) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await runUpscale(inputBase64, settings.width, settings.height, upscaleScale);
      setOutputBase64(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리 실패");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!outputBase64) return;
    addImage({
      base64: outputBase64,
      params: {
        model: settings.model,
        prompt: "",
        negativePrompt: "",
        width: settings.width * upscaleScale,
        height: settings.height * upscaleScale,
        steps: 0,
        cfgScale: 0,
        sampler: settings.sampler,
        seed: 0,
        noiseSchedule: settings.noiseSchedule,
        qualityToggle: false,
        smea: false,
        smeaDyn: false,
      },
      tool: "upscale",
    });
  };

  return (
    <div className="flex gap-4">
      <div className="flex w-64 shrink-0 flex-col gap-3">
        <ImageDropZone base64={inputBase64} onLoad={setInputBase64} label="업스케일할 이미지" />
        <div className="flex gap-2">
          {([2, 4] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setUpscaleScale(s)}
              className={cn(
                "flex-1 rounded-md border py-1.5 text-xs transition-colors",
                upscaleScale === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-secondary"
              )}
            >
              ×{s}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          현재 해상도 ({settings.width}×{settings.height}) 기준 ×{upscaleScale} 업스케일
        </p>
        <Button onClick={handleRun} disabled={!inputBase64 || isProcessing} className="w-full">
          {isProcessing ? <><SpinnerIcon /> 처리 중...</> : "업스케일"}
        </Button>
      </div>
      <div className="flex-1">
        <ResultPanel base64={outputBase64} isProcessing={isProcessing} error={error} onSaveToLibrary={handleSaveToLibrary} tool="upscale" />
      </div>
    </div>
  );
}

// ─── 배경 제거 도구 ───────────────────────────────────────────────────────────

function BgRemoveTool() {
  const { inputBase64, outputBase64, isProcessing, error, setInputBase64, setOutputBase64, setProcessing, setError } = useToolsStore();
  const settings = useSettingsStore();
  const { addImage } = useLibraryStore();

  const handleRun = async () => {
    if (!inputBase64) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await runRemoveBackground(inputBase64);
      setOutputBase64(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리 실패");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!outputBase64) return;
    addImage({
      base64: outputBase64,
      params: {
        model: settings.model,
        prompt: "",
        negativePrompt: "",
        width: settings.width,
        height: settings.height,
        steps: 0,
        cfgScale: 0,
        sampler: settings.sampler,
        seed: 0,
        noiseSchedule: settings.noiseSchedule,
        qualityToggle: false,
        smea: false,
        smeaDyn: false,
      },
      tool: "bgremove",
    });
  };

  return (
    <div className="flex gap-4">
      <div className="flex w-64 shrink-0 flex-col gap-3">
        <ImageDropZone base64={inputBase64} onLoad={setInputBase64} label="배경 제거할 이미지" />
        <p className="text-[10px] text-muted-foreground">
          NovelAI API를 사용하여 배경을 자동으로 제거합니다.
        </p>
        <Button onClick={handleRun} disabled={!inputBase64 || isProcessing} className="w-full">
          {isProcessing ? <><SpinnerIcon /> 처리 중...</> : "배경 제거"}
        </Button>
      </div>
      <div className="flex-1">
        <ResultPanel base64={outputBase64} isProcessing={isProcessing} error={error} onSaveToLibrary={handleSaveToLibrary} tool="bgremove" />
      </div>
    </div>
  );
}

// ─── 인페인팅 ─────────────────────────────────────────────────────────────────

function InpaintTool() {
  const { inputBase64, outputBase64, isProcessing, error, strength, setInputBase64, setOutputBase64, setProcessing, setError, setStrength } = useToolsStore();
  const settings = useSettingsStore();
  const { addImage } = useLibraryStore();
  const [maskBase64, setMaskBase64] = useState<string | null>(null);

  const handleRun = async () => {
    if (!inputBase64 || !maskBase64) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await runInpaint(
        {
          model: settings.model,
          prompt: settings.prompt,
          negativePrompt: settings.negativePrompt,
          width: settings.width,
          height: settings.height,
          steps: settings.steps,
          cfgScale: settings.cfgScale,
          sampler: settings.sampler,
          seed: Math.floor(Math.random() * 4_294_967_295),
          noiseSchedule: settings.noiseSchedule,
          qualityToggle: settings.qualityToggle,
          smea: settings.smea,
          smeaDyn: settings.smeaDyn,
        },
        inputBase64,
        maskBase64,
        strength
      );
      setOutputBase64(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리 실패");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!outputBase64) return;
    addImage({
      base64: outputBase64,
      params: {
        model: settings.model,
        prompt: settings.prompt,
        negativePrompt: settings.negativePrompt,
        width: settings.width,
        height: settings.height,
        steps: settings.steps,
        cfgScale: settings.cfgScale,
        sampler: settings.sampler,
        seed: 0,
        noiseSchedule: settings.noiseSchedule,
        qualityToggle: settings.qualityToggle,
        smea: settings.smea,
        smeaDyn: settings.smeaDyn,
      },
      tool: "inpaint",
    });
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-1 flex-col gap-3">
        {inputBase64 ? (
          <CanvasMaskEditor imageBase64={inputBase64} onMaskChange={setMaskBase64} />
        ) : (
          <ImageDropZone base64={null} onLoad={setInputBase64} label="인페인팅할 이미지" />
        )}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">강도</span>
            <input
              type="range" min={0.1} max={0.99} step={0.01} value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-xs text-foreground">{strength.toFixed(2)}</span>
          </div>
          {inputBase64 && (
            <button
              type="button"
              onClick={() => { setInputBase64(null); setMaskBase64(null); }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              이미지 변경
            </button>
          )}
          <Button onClick={handleRun} disabled={!inputBase64 || !maskBase64 || isProcessing} size="sm">
            {isProcessing ? "처리 중..." : "인페인팅"}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="w-64 shrink-0">
        <ResultPanel base64={outputBase64} isProcessing={isProcessing} error={null} onSaveToLibrary={handleSaveToLibrary} tool="inpaint" />
      </div>
    </div>
  );
}

// ─── 모자이크 ─────────────────────────────────────────────────────────────────

function MosaicTool() {
  const { inputBase64, outputBase64, isProcessing, error, setInputBase64, setOutputBase64, setProcessing, setError } = useToolsStore();
  const { addImage } = useLibraryStore();
  const settings = useSettingsStore();
  const [maskBase64, setMaskBase64] = useState<string | null>(null);
  const [blockSize, setBlockSize] = useState(16);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleRun = () => {
    if (!inputBase64) return;
    setProcessing(true);
    setError(null);
    try {
      const mCanvas = document.createElement("canvas");
      const mCtx = mCanvas.getContext("2d");
      if (!mCtx) throw new Error("Canvas 초기화 실패");

      const img = new Image();
      img.onload = () => {
        mCanvas.width = img.width;
        mCanvas.height = img.height;

        if (maskBase64) {
          const maskImg = new Image();
          maskImg.onload = () => {
            mCtx.drawImage(maskImg, 0, 0, img.width, img.height);

            const srcCanvas = document.createElement("canvas");
            srcCanvas.width = img.width;
            srcCanvas.height = img.height;
            const srcCtx = srcCanvas.getContext("2d")!;
            srcCtx.drawImage(img, 0, 0);

            const result = applyMosaic(srcCanvas, mCanvas, blockSize);
            const b64 = result.replace(/^data:[^;]+;base64,/, "");
            setOutputBase64(b64);
            setProcessing(false);
          };
          maskImg.src = `data:image/png;base64,${maskBase64}`;
        } else {
          setError("마스크를 먼저 그려주세요.");
          setProcessing(false);
        }
      };
      img.src = `data:image/png;base64,${inputBase64}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "처리 실패");
      setProcessing(false);
    }
  };

  // unused ref warning 방지
  void imageCanvasRef;
  void maskCanvasRef;

  const handleSaveToLibrary = () => {
    if (!outputBase64) return;
    addImage({
      base64: outputBase64,
      params: {
        model: settings.model, prompt: "", negativePrompt: "",
        width: settings.width, height: settings.height,
        steps: 0, cfgScale: 0, sampler: settings.sampler, seed: 0,
        noiseSchedule: settings.noiseSchedule, qualityToggle: false, smea: false, smeaDyn: false,
      },
      tool: "mosaic",
    });
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-1 flex-col gap-3">
        {inputBase64 ? (
          <CanvasMaskEditor imageBase64={inputBase64} onMaskChange={setMaskBase64} />
        ) : (
          <ImageDropZone base64={null} onLoad={setInputBase64} label="모자이크 적용할 이미지" />
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">블록 크기</span>
            <input
              type="range" min={4} max={48} step={2} value={blockSize}
              onChange={(e) => setBlockSize(Number(e.target.value))}
              className="w-24 accent-primary"
            />
            <span className="text-xs text-foreground">{blockSize}px</span>
          </div>
          {inputBase64 && (
            <button
              type="button"
              onClick={() => { setInputBase64(null); setMaskBase64(null); }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              이미지 변경
            </button>
          )}
          <Button onClick={handleRun} disabled={!inputBase64 || isProcessing} size="sm">
            {isProcessing ? "처리 중..." : "모자이크 적용"}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="w-64 shrink-0">
        <ResultPanel base64={outputBase64} isProcessing={isProcessing} error={null} onSaveToLibrary={handleSaveToLibrary} tool="mosaic" />
      </div>
    </div>
  );
}

// ─── 태그 분석 (준비 중) ──────────────────────────────────────────────────────

function TagAnalysisTool() {
  const { inputBase64, setInputBase64 } = useToolsStore();

  return (
    <div className="flex gap-4">
      <div className="w-64 shrink-0">
        <ImageDropZone base64={inputBase64} onLoad={setInputBase64} label="분석할 이미지" />
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        태그 분석 — Gemini API 키 설정 후 사용 가능
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function ToolsMode() {
  const { activeTool, setActiveTool, reset } = useToolsStore();

  const handleTabChange = (tool: ToolType) => {
    setActiveTool(tool);
    reset();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      {/* 탭 */}
      <div className="mb-4 flex shrink-0 gap-1 border-b border-border pb-3">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabChange(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs transition-colors",
              activeTool === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 도구 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {activeTool === "img2img" && <Img2ImgTool />}
        {activeTool === "upscale" && <UpscaleTool />}
        {activeTool === "bgremove" && <BgRemoveTool />}
        {activeTool === "inpaint" && <InpaintTool />}
        {activeTool === "mosaic" && <MosaicTool />}
        {activeTool === "taganalysis" && <TagAnalysisTool />}
      </div>
    </div>
  );
}
