import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

// ─── 아이콘 ───────────────────────────────────────────────────────────────────

function MainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function ScenesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function RPIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

const COMPACT_BREAKPOINT = 700;

export default function AnimatedNavBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCompact(entry.contentRect.width < COMPACT_BREAKPOINT);
      }
    });
    const el = document.getElementById("nav-center");
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const items = [
    { to: "/",        icon: <MainIcon />,    labelKey: "nav.main",     end: true },
    { to: "/scenes",  icon: <ScenesIcon />,  labelKey: "nav.scenes" },
    { to: "/tools",   icon: <ToolsIcon />,   labelKey: "nav.tools" },
    { to: "/web",     icon: <WebIcon />,     labelKey: "nav.web" },
    { to: "/library", icon: <LibraryIcon />, labelKey: "nav.library" },
    { to: "/llm-rp",  icon: <RPIcon />,      labelKey: "nav.llmRp" },
    { to: "/settings",icon: <SettingsIcon />,labelKey: "nav.settings" },
  ];

  return (
    <nav
      id="nav-center"
      className="flex h-11 shrink-0 items-center justify-center gap-0.5 border-b border-white/5 bg-card/40 backdrop-blur-md px-2"
    >
      {items.map((item) => {
        const isActive =
          item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="relative"
          >
            {({ isActive: navActive }) => (
              <span
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                  compact ? "px-2.5" : "px-3",
                  navActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* 활성 배경 (Framer Motion layoutId) */}
                {(navActive || isActive) && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-lg bg-white/8 border border-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                {!compact && (
                  <span className="relative z-10">{t(item.labelKey)}</span>
                )}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
