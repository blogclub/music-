import { useEffect, useState } from "react";
import "../styles/global.css";
import "../styles/blur.css";
import { AnimatePresence } from "framer-motion";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";

import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SongIdsProvider } from "@/components/layout/SongIdsContext";
import Player from "@/components/layout/Player";
import Bar from "@/components/layout/Bar";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function MyApp({ Component, pageProps }) {
  const [showChild, setShowChild] = useState(false);
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }
  return (
    <SongIdsProvider>
      <ThemeProvider defaultTheme="system" attribute="class">
        <AnimatePresence>
          <Bar />
          <div className="flex flex-row">
            <Sidebar />
            <div className="px-4 md:px-8 sm:px-12 py-8 w-full md:w-[70%] sm:w-4/5 h-screen overflow-y-auto">
              <Component {...pageProps} />
            </div>
          </div>
          <div className="fixed py-2 px-6 md:px-96 sm:px-96 bottom-0 z-[99999]">
            <Player />
          </div>
          <div className="px-96 fixed right-0 max-w-40 w-full z-[9999999]">
            <Toaster className="max-w-40 w-full" />
          </div>
        </AnimatePresence>
        <Analytics />
      </ThemeProvider>
    </SongIdsProvider>
  );
}
