import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import TitleBar from "./TitleBar";
import Sidebar from "./Sidebar";
import UpdateBanner from "./UpdateBanner";
import { useLayoutStore } from "@/stores/layout-store";

export default function ThreeColumnLayout() {
  const { rightPanelOpen } = useLayoutStore();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* 커스텀 타이틀바 */}
      <TitleBar />
      {/* 업데이트 배너 */}
      <UpdateBanner />

      {/* 본문 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바 */}
        <Sidebar />

        {/* 중앙 콘텐츠 */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>

        {/* 우측 패널 (슬라이드인) */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col overflow-hidden border-l border-border bg-card"
            >
              <div className="h-full w-80 overflow-y-auto p-4">
                {/* 우측 패널 콘텐츠는 각 페이지에서 layout-store를 통해 주입 */}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
