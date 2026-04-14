import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSceneGeneration } from "@/hooks/useSceneGeneration";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useUpdateChecker } from "@/hooks/useUpdateChecker";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import MainMode from "@/pages/MainMode";
import SceneMode from "@/pages/SceneMode";
import SceneDetail from "@/pages/SceneDetail";
import ToolsMode from "@/pages/ToolsMode";
import WebView from "@/pages/WebView";
import Library from "@/pages/Library";
import Settings from "@/pages/Settings";
import LLMRPMode from "@/pages/LLMRPMode";

function AppContent() {
  // 전역 훅
  useSceneGeneration();
  useShortcuts();
  useUpdateChecker();

  // 전역 우클릭 차단: data-allow-context-menu 속성이 있는 요소만 허용
  useEffect(() => {
    function blockContextMenu(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-allow-context-menu]")) {
        e.preventDefault();
      }
    }
    document.addEventListener("contextmenu", blockContextMenu);
    return () => document.removeEventListener("contextmenu", blockContextMenu);
  }, []);

  return (
    <Routes>
      <Route element={<ThreeColumnLayout />}>
        <Route path="/" element={<MainMode />} />
        <Route path="/scenes" element={<SceneMode />} />
        <Route path="/scenes/:id" element={<SceneDetail />} />
        <Route path="/tools" element={<ToolsMode />} />
        <Route path="/web" element={<WebView />} />
        <Route path="/library" element={<Library />} />
        <Route path="/llm-rp" element={<LLMRPMode />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </TooltipProvider>
    </BrowserRouter>
  );
}
