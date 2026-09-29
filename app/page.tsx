"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import DailyPlanner from "@/components/DailyPlanner";
import HabitTracker from "@/components/HabitTracker";
import Header from "@/components/Header";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"planner" | "habits">("planner");
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* iOS-style Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="ios-blur bg-black/80 border-t border-gray-800">
          <div className="max-w-lg mx-auto flex">
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                activeTab === "planner" ? "text-blue-400" : "text-gray-500"
              }`}
            >
              <span className="text-xl">📋</span>
              <span className="text-[10px] font-medium">แผนประจำวัน</span>
            </button>
            <button
              onClick={() => setActiveTab("habits")}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                activeTab === "habits" ? "text-blue-400" : "text-gray-500"
              }`}
            >
              <span className="text-xl">🔥</span>
              <span className="text-[10px] font-medium">ติดตามนิสัย</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {activeTab === "planner" ? <DailyPlanner /> : <HabitTracker />}
      </main>
    </div>
  );
}
