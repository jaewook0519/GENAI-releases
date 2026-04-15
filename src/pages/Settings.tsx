import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import * as Switch from "@radix-ui/react-switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useThemeStore } from "@/stores/theme-store";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">
      {children}
    </h2>
  );
}

function FieldRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1">
        <p className="text-sm text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const inputClass = cn(
  "h-8 rounded-md border border-border bg-secondary px-2.5 text-xs text-foreground",
  "focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
);

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { token, setToken, clearToken } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const settings = useSettingsStore();
  const [appVersion, setAppVersion] = useState("...");

  useEffect(() => {
    getVersion()
      .then(setAppVersion)
      .catch(() => setAppVersion("0.1.1"));
  }, []);

  const handleTokenChange = (value: string) => {
    if (value.trim()) setToken(value.trim());
    else clearToken();
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-8 p-6">
        {/* 인증 */}
        <section>
          <SectionTitle>{t("settings.auth")}</SectionTitle>
          <FieldRow
            label="NovelAI API 토큰"
            description="설정 후 앱 재시작 없이 즉시 적용됩니다."
          >
            <input
              type="password"
              defaultValue={token ?? ""}
              onBlur={(e) => handleTokenChange(e.target.value)}
              placeholder="Bearer token..."
              className={cn(inputClass, "w-64")}
            />
          </FieldRow>
          <FieldRow
            label="Gemini API 키"
            description="태그 분석 도구에 사용됩니다. 설정 후 즉시 저장됩니다."
          >
            <input
              type="password"
              defaultValue={settings.geminiApiKey}
              onBlur={(e) => settings.setGeminiApiKey(e.target.value.trim())}
              placeholder="AIza..."
              className={cn(inputClass, "w-64")}
            />
          </FieldRow>
        </section>

        {/* 생성 기본값 */}
        <section>
          <SectionTitle>{t("settings.generation")}</SectionTitle>
          <FieldRow label="기본 스텝" description="1–50">
            <input
              type="number"
              value={settings.steps}
              min={1}
              max={50}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v >= 1 && v <= 50) settings.update({ steps: v });
              }}
              className={cn(inputClass, "w-20 text-center")}
            />
          </FieldRow>
          <FieldRow label="기본 CFG 스케일" description="0–10">
            <input
              type="number"
              value={settings.cfgScale}
              min={0}
              max={10}
              step={0.1}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v)) settings.update({ cfgScale: Math.round(v * 10) / 10 });
              }}
              className={cn(inputClass, "w-20 text-center")}
            />
          </FieldRow>
          <FieldRow label="품질 향상 (Quality Toggle)">
            <Switch.Root
              checked={settings.qualityToggle}
              onCheckedChange={(v) => settings.update({ qualityToggle: v })}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                settings.qualityToggle ? "bg-primary" : "bg-secondary"
              )}
            >
              <Switch.Thumb
                className={cn(
                  "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform",
                  settings.qualityToggle ? "translate-x-4" : "translate-x-0"
                )}
              />
            </Switch.Root>
          </FieldRow>
        </section>

        {/* 테마 */}
        <section>
          <SectionTitle>{t("settings.theme")}</SectionTitle>
          <FieldRow label={t("settings.theme")}>
            <div className="flex gap-2">
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                {t("settings.dark")}
              </Button>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                {t("settings.light")}
              </Button>
            </div>
          </FieldRow>
        </section>

        {/* 언어 */}
        <section>
          <SectionTitle>{t("settings.language")}</SectionTitle>
          <FieldRow label={t("settings.language")}>
            <div className="flex gap-2">
              {(["ko", "en", "ja"] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={i18n.language === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang === "ko" ? "한국어" : lang === "en" ? "English" : "日本語"}
                </Button>
              ))}
            </div>
          </FieldRow>
        </section>

        {/* 버전 정보 */}
        <section>
          <SectionTitle>앱 정보</SectionTitle>
          <FieldRow label="버전">
            <span className="text-xs text-muted-foreground">{appVersion}</span>
          </FieldRow>
        </section>
      </div>
    </div>
  );
}
