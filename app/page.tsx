"use client";

import { useState } from "react";
import DailyPlanner from "@/components/DailyPlanner";
import HabitTracker from "@/components/HabitTracker";
import Header from "@/components/Header";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"planner" | "habits">("planner");

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "planner"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            📋 แผนประจำวัน
          </button>
          <button
            onClick={() => setActiveTab("habits")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "habits"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            🔥 ติดตามนิสัย
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "planner" ? <DailyPlanner /> : <HabitTracker />}
      </main>
    </div>
  );
}
