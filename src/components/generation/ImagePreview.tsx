import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore } from "@/stores/generation-store";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

function PlaceholderIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground/30"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        className="animate-spin text-primary"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <span className="text-sm text-muted-foreground animate-pulse">생성 중...</span>
    </div>
  );
}

export default function ImagePreview() {
  const { t } = useTranslation();
  const { isGenerating, previewBase64, lastImage, error, clearError } = useGenerationStore();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {/* 에러 상태 */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 p-6 text-center"
          >
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <div className="mb-1 font-medium">{t("generation.generationError")}</div>
              <div className="text-xs opacity-80">{error}</div>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-xs text-muted-foreground underline hover:text-foreground"
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
            <LoadingSpinner />
          </motion.div>
        )}

        {/* 생성된 이미지 */}
        {!isGenerating && !error && previewBase64 && (
          <motion.div
            key={lastImage?.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex h-full w-full items-center justify-center p-4"
          >
            <img
              src={`data:image/png;base64,${previewBase64}`}
              alt="Generated"
              className={cn(
                "max-h-full max-w-full rounded-lg object-contain shadow-lg",
                "select-none"
              )}
              data-allow-context-menu
            />
          </motion.div>
        )}

        {/* 플레이스홀더 */}
        {!isGenerating && !error && !previewBase64 && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 select-none"
          >
            <PlaceholderIcon />
            <span className="text-sm text-muted-foreground/50">
              {t("generation.noImage")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이미지 메타 정보 (우하단) */}
      {lastImage && !isGenerating && (
        <div className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm">
          {lastImage.params.width}×{lastImage.params.height} · seed {lastImage.params.seed}
        </div>
      )}
    </div>
  );
}
