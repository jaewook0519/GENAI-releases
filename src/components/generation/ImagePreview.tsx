import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore } from "@/stores/generation-store";
import { useLibraryStore } from "@/stores/library-store";
import { useTranslation } from "react-i18next";

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="rounded-full border border-white/10 bg-white/3 p-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-muted-foreground/30">
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

export default function ImagePreview() {
  const { t } = useTranslation();
  const { isGenerating, previewBase64, lastImage, error, clearError } = useGenerationStore();
  const { selectImage } = useLibraryStore();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">

      <AnimatePresence mode="wait">
        {/* 에러 */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 p-6 text-center"
          >
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive backdrop-blur-md">
              <div className="mb-1 font-medium">{t("generation.generationError")}</div>
              <div className="text-xs opacity-70">{error}</div>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              {t("common.close")}
            </button>
          </motion.div>
        )}

        {/* 생성 중 */}
        {isGenerating && !error && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GeneratingState />
          </motion.div>
        )}

        {/* 생성된 이미지 */}
        {!isGenerating && !error && previewBase64 && (
          <motion.div
            key={lastImage?.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex h-full w-full items-center justify-center p-4"
            onClick={() => lastImage && selectImage(lastImage.id)}
          >
            <img
              src={`data:image/png;base64,${previewBase64}`}
              alt="Generated"
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl select-none cursor-pointer"
              data-allow-context-menu
            />
          </motion.div>
        )}

        {/* 빈 상태 */}
        {!isGenerating && !error && !previewBase64 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <EmptyState />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 info bar */}
      {lastImage && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] font-mono text-white/60 backdrop-blur-md">
            <span>{lastImage.params.width}×{lastImage.params.height}</span>
            <span className="text-white/25">·</span>
            <span>seed {lastImage.params.seed ?? "random"}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
