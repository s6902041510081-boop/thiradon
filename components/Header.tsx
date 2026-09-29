"use client";

import { useAuth } from "@/components/AuthProvider";

export default function Header() {
  const { user, signOut } = useAuth();

  const today = new Date();
  const dateStr = today.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="ios-blur bg-black/80 sticky top-0 z-40 border-b border-gray-800">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Life Scheduler</h1>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{user?.email?.split("@")[0]}</span>
          <button
            onClick={signOut}
            className="ios-press text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  );
}
