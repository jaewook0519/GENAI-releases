import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setToken } = useAuthStore();
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (isAuthenticated()) {
    return <>{children}</>;
  }

  function handleSave() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    setToken(trimmed);
    setError(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          {t("auth.title")}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("auth.description")}
        </p>

        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {t("auth.tokenLabel")}
        </label>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("auth.tokenPlaceholder")}
          className={`mb-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-primary ${
            error ? "border-destructive" : "border-input"
          }`}
        />
        {error && (
          <p className="mb-4 text-xs text-destructive">{t("auth.invalidToken")}</p>
        )}

        <button
          onClick={handleSave}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("auth.save")}
        </button>
      </div>
    </div>
  );
}
