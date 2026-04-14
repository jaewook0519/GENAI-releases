import { useTranslation } from "react-i18next";
import { useUpdateStore } from "@/stores/update-store";
import { cn } from "@/lib/cn";

export default function UpdateBanner() {
  const { t } = useTranslation();
  const { available, version, installing, dismissed, installUpdate, dismiss } = useUpdateStore();

  if (!available || dismissed) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b border-primary/20",
        "bg-primary/10 px-4 py-2 text-xs"
      )}
    >
      <span className="text-foreground">
        {t("update.available", { version: version ?? "" })}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => installUpdate()}
          disabled={installing}
          className={cn(
            "rounded-md bg-primary px-3 py-1 text-primary-foreground transition-opacity",
            installing && "opacity-60 cursor-not-allowed"
          )}
        >
          {installing ? t("update.installing") : t("update.install")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          disabled={installing}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("update.dismiss")}
        </button>
      </div>
    </div>
  );
}
