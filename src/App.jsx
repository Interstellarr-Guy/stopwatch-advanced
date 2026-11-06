import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Stopwatch from "./components/Stopwatch";
import RightSidebar from "./components/RightSidebar";

export default function App() {
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState("stopwatch");

  // Theme Sync
  useEffect(() => {
    document.body.className = dark ? "dark" : "";
  }, [dark]);

  return (
    <div className={`app-layout ${dark ? "dark" : ""}`}>
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        dark={dark}
        setDark={setDark}
      />

      <div className="main-body bg-[#a6a9ab]">
        <Sidebar
          isOpen={sidebarOpen}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <main className="content-area bg-[#c0c5c9]">
          {currentTab === "stopwatch" && <Stopwatch />}
          {currentTab === "laps" && <div className="placeholder-view"><h2>Saved Laps View</h2></div>}
          {currentTab === "settings" && <div className="placeholder-view"><h2>Settings View</h2></div>}
        </main>

        <RightSidebar />

      </div>
    </div>
  );
}