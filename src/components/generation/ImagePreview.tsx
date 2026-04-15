import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore } from "@/stores/generation-store";
import { useTranslation } from "react-i18next";
import type { LibraryImage } from "@/stores/library-store";

// ─── 아이콘 ───────────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="rounded-full border border-white/8 bg-white/3 p-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-muted-foreground/25">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <span className="text-sm text-muted-foreground/40">{t("generation.noImage")}</span>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="relative">
        <svg className="animate-spin text-primary" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse" />
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground animate-pulse">생성 중...</span>
    </div>
  );
}

// ─── 이미지 상세 모달 ─────────────────────────────────────────────────────────

function ImageDetailModal({
  image,
  base64,
  onClose,
}: {
  image: LibraryImage;
  base64: string;
  onClose: () => void;
}) {
  const { generate } = useGenerationStore();

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${base64}`;
    a.download = `genai_${image.id}.png`;
    a.click();
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(`data:image/png;base64,${base64}`);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch {
      // ignore
    }
    onClose();
  };

  const handleRegenerate = () => {
    generate({ ...image.params });
    onClose();
  };

  const rows: [string, string][] = [
    ["모델", image.params.model ?? "-"],
    ["해상도", `${image.params.width} × ${image.params.height}`],
    ["시드", String(image.params.seed ?? "random")],
    ["스텝", String(image.params.steps ?? "-")],
    ["CFG", String(image.params.cfgScale ?? "-")],
    ["샘플러", image.params.sampler ?? "-"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative flex max-h-[90vh] w-[min(880px,95vw)] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 */}
        <div className="flex flex-1 items-center justify-center bg-black/30 p-4">
          <img
            src={`data:image/png;base64,${base64}`}
            alt="Generated"
            className="max-h-[80vh] max-w-full rounded-lg object-contain select-none"
            data-allow-context-menu
          />
        </div>

        {/* 사이드 패널 */}
        <div className="flex w-56 shrink-0 flex-col gap-4 border-l border-white/8 bg-card p-4">
          {/* 닫기 */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">상세 정보</span>
            <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <svg width="10" height="10" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.3">
                <line x1="0" y1="0" x2="9" y2="9" /><line x1="9" y1="0" x2="0" y2="9" />
              </svg>
            </button>
          </div>

          {/* 메타데이터 */}
          <div className="flex flex-col gap-1.5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/50">{label}</span>
                <span className="text-[11px] font-mono text-foreground/80 break-all">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            {/* 복사 */}
            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-xs text-foreground hover:bg-muted transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              클립보드 복사
            </button>

            {/* 다운로드 */}
            <button
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-xs text-foreground hover:bg-muted transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              다운로드
            </button>

            {/* 재생성 */}
            <button
              onClick={handleRegenerate}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              동일 파라미터로 재생성
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function ImagePreview() {
  const { t } = useTranslation();
  const { isGenerating, previewBase64, lastImage, error, clearError } = useGenerationStore();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">

      <AnimatePresence mode="wait">
        {/* 에러 */}
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 p-6 text-center"
          >
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              <div className="mb-1 font-medium">{t("generation.generationError")}</div>
              <div className="text-xs opacity-70">{error}</div>
            </div>
            <button type="button" onClick={clearError} className="text-xs text-muted-foreground underline hover:text-foreground transition-colors">
              {t("common.close")}
            </button>
          </motion.div>
        )}

        {/* 생성 중 */}
        {isGenerating && !error && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GeneratingState />
          </motion.div>
        )}

        {/* 생성된 이미지 */}
        {!isGenerating && !error && previewBase64 && lastImage && (
          <motion.div
            key={lastImage.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="flex h-full w-full items-center justify-center p-4"
          >
            <div className="group relative cursor-zoom-in" onClick={() => setModalOpen(true)}>
              <img
                src={`data:image/png;base64,${previewBase64}`}
                alt="Generated"
                className="max-h-[calc(100vh-120px)] max-w-full rounded-xl object-contain shadow-2xl select-none"
                data-allow-context-menu
              />
              {/* 호버 힌트 */}
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors">
                <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  클릭하여 상세 보기
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 빈 상태 */}
        {!isGenerating && !error && !previewBase64 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 info bar */}
      {lastImage && !isGenerating && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] font-mono text-white/60 backdrop-blur-md select-none">
            <span>{lastImage.params.width}×{lastImage.params.height}</span>
            <span className="text-white/25">·</span>
            <span>seed {lastImage.params.seed ?? "random"}</span>
          </div>
        </motion.div>
      )}

      {/* 상세 모달 */}
      <AnimatePresence>
        {modalOpen && lastImage && previewBase64 && (
          <ImageDetailModal
            image={lastImage}
            base64={previewBase64}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
