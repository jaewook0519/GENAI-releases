import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TitleBar from "./TitleBar";
import AnimatedNavBar from "./AnimatedNavBar";
import HistoryPanel from "./HistoryPanel";
import UpdateBanner from "./UpdateBanner";
import GenerationPanel from "@/components/generation/GenerationPanel";
import { useLayoutStore } from "@/stores/layout-store";

const PANEL_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const };

export default function ThreeColumnLayout() {
  const { leftPanelOpen, rightPanelOpen } = useLayoutStore();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* 타이틀바 */}
      <TitleBar />

      {/* 업데이트 배너 */}
      <UpdateBanner />

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── 좌측: 생성 패널 ─────────────────────────────── */}
        <AnimatePresence initial={false}>
          {leftPanelOpen && (
            <motion.div
              key="left-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={PANEL_TRANSITION}
              className="flex h-full shrink-0 flex-col overflow-hidden border-r border-white/5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="h-full w-[360px] overflow-y-auto">
                <GenerationPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 중앙: 내비게이션 + 콘텐츠 ────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AnimatedNavBar />
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>

        {/* ── 우측: 히스토리 패널 ────────────────────────── */}
        <AnimatePresence initial={false}>
          {rightPanelOpen && (
            <motion.div
              key="right-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={PANEL_TRANSITION}
              className="flex h-full shrink-0 flex-col overflow-hidden border-l border-white/5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="h-full w-[280px] overflow-hidden">
                <HistoryPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
