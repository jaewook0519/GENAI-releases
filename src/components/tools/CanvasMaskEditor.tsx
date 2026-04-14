import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

interface Props {
  imageBase64: string;
  onMaskChange: (maskBase64: string) => void;
}

export default function CanvasMaskEditor({ imageBase64, onMaskChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(24);
  const [isErasing, setIsErasing] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // 이미지 로드 → imageCanvas에 그리기
  useEffect(() => {
    const imageCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!imageCanvas || !maskCanvas) return;

    const img = new Image();
    img.onload = () => {
      // 컨테이너 크기에 맞게 캔버스 크기 설정
      const maxW = containerRef.current?.clientWidth ?? 512;
      const maxH = 480;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);

      imageCanvas.width = w;
      imageCanvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;

      const ctx = imageCanvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, w, h);

      // 마스크 초기화 (투명)
      const mCtx = maskCanvas.getContext("2d");
      if (mCtx) {
        mCtx.clearRect(0, 0, w, h);
      }
      emitMask();
    };
    img.src = `data:image/png;base64,${imageBase64}`;
  }, [imageBase64]); // eslint-disable-line react-hooks/exhaustive-deps

  const emitMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    // 흰색 마스크 이미지 생성 (NovelAI 인페인팅은 흰색=편집 영역)
    const out = document.createElement("canvas");
    out.width = maskCanvas.width;
    out.height = maskCanvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(maskCanvas, 0, 0);
    const dataUrl = out.toDataURL("image/png");
    onMaskChange(dataUrl.replace(/^data:[^;]+;base64,/, ""));
  }, [onMaskChange]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawAt = (x: number, y: number, from?: { x: number; y: number }) => {
    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas?.getContext("2d");
    if (!ctx || !maskCanvas) return;

    ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
    ctx.fillStyle = "rgba(255, 80, 80, 0.85)";
    ctx.strokeStyle = "rgba(255, 80, 80, 0.85)";
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    if (from) {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    drawAt(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    drawAt(pos.x, pos.y, lastPos.current ?? undefined);
    lastPos.current = pos;
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    emitMask();
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas?.getContext("2d");
    if (!ctx || !maskCanvas) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    emitMask();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 툴바 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsErasing(false)}
            className={cn(
              "rounded px-2 py-1 text-xs transition-colors",
              !isErasing ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
            )}
          >
            브러시
          </button>
          <button
            type="button"
            onClick={() => setIsErasing(true)}
            className={cn(
              "rounded px-2 py-1 text-xs transition-colors",
              isErasing ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
            )}
          >
            지우개
          </button>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <span className="shrink-0 text-[10px] text-muted-foreground">브러시 크기</span>
          <input
            type="range"
            min={4}
            max={80}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="w-6 text-right text-[10px] text-muted-foreground">{brushSize}</span>
        </div>
        <button
          type="button"
          onClick={clearMask}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          마스크 초기화
        </button>
      </div>

      {/* 캔버스 영역 */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-border bg-secondary/30"
        style={{ minHeight: 300 }}
      >
        <canvas ref={imageCanvasRef} className="block" />
        <canvas
          ref={maskCanvasRef}
          className="absolute left-0 top-0 cursor-crosshair opacity-70"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        빨간 영역이 인페인팅될 마스크 영역입니다.
      </p>
    </div>
  );
}
