"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  target_days: number;
  user_id?: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

const HABIT_ICONS = ["💧", "📚", "🏃", "🧘", "😴", "🥗", "✍️", "🎵", "🚶", "💊"];
const HABIT_COLORS = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-teal-400 to-teal-600",
  "from-indigo-400 to-indigo-600",
  "from-red-400 to-red-600",
];

export default function HabitTracker() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("💧");
  const [newHabitColor, setNewHabitColor] = useState("from-blue-400 to-blue-600");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);

  async function fetchHabits() {
    setLoading(true);
    if (isSupabaseConfigured && supabase && user) {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching habits:", error);
      else setHabits(data || []);
    }
    setLoading(false);
  }

  async function fetchLogs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("habit_logs").select("*").eq("date", today);
      if (error) console.error("Error fetching logs:", error);
      else setLogs(data || []);
    }
  }

  async function addHabit() {
    if (!newHabitName.trim() || !user) return;
    setSaving(true);

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      icon: newHabitIcon,
      color: newHabitColor,
      target_days: 7,
      user_id: user.id,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("habits").insert([habit]).select();
      if (error) console.error("Error adding habit:", error);
      else if (data) setHabits([...habits, data[0]]);
    }

    setNewHabitName("");
    setSaving(false);
  }

  async function toggleHabitLog(habitId: string) {
    const existingLog = logs.find((l) => l.habit_id === habitId && l.date === today);

    if (isSupabaseConfigured && supabase) {
      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ completed: !existingLog.completed })
          .eq("id", existingLog.id);

        if (!error) {
          setLogs(logs.map((l) => (l.id === existingLog.id ? { ...l, completed: !l.completed } : l)));
        }
      } else {
        const { data, error } = await supabase
          .from("habit_logs")
          .insert([{ habit_id: habitId, date: today, completed: true }])
          .select();

        if (!error && data) setLogs([...logs, data[0]]);
      }
    }
  }

  async function deleteHabit(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (!error) {
        setHabits(habits.filter((h) => h.id !== id));
        setLogs(logs.filter((l) => l.habit_id !== id));
      }
    }
  }

  function getStreak(habitId: string): number {
    let streak = 0;
    const todayDate = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = logs.find((l) => l.habit_id === habitId && l.date === dateStr);
      if (log?.completed) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  const completedToday = logs.filter((l) => l.completed).length;

  return (
    <div className="space-y-5">
      {/* Summary Card */}
      <div className="ios-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">นิสัยที่ทำสำเร็จวันนี้</p>
            <p className="text-3xl font-bold text-white mt-1">
              {completedToday}
              <span className="text-lg text-gray-500 font-normal">/{habits.length}</span>
            </p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
      </div>

      {/* Add Habit Form */}
      <div className="ios-card p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">เพิ่มนิสัยใหม่</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="เช่น ดื่มน้ำ อ่านหนังสือ ออกกำลังกาย..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3.5 rounded-xl text-sm focus:outline-none"
          />
          <div className="flex gap-2 flex-wrap">
            {HABIT_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setNewHabitIcon(icon)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  newHabitIcon === icon ? "bg-gray-700 ring-2 ring-blue-500" : "bg-gray-800"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1.5">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewHabitColor(color)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-b ${color} transition-all ${
                    newHabitColor === color ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-white" : ""
                  }`}
                />
              ))}
            </div>
            <button
              onClick={addHabit}
              disabled={saving || !newHabitName.trim()}
              className="ios-press ml-auto px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-40"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌿</p>
            <p className="text-gray-400 text-sm">ยังไม่มีนิสัยที่ติดตาม</p>
            <p className="text-gray-600 text-xs mt-1">เริ่มสร้างนิสัยแรกของคุณเลย!</p>
          </div>
        ) : (
          habits.map((habit) => {
            const log = logs.find((l) => l.habit_id === habit.id && l.date === today);
            const isCompleted = log?.completed || false;
            const streak = getStreak(habit.id);

            return (
              <div
                key={habit.id}
                className={`ios-card p-4 flex items-center gap-3 ${
                  isCompleted ? "bg-green-500/5" : ""
                }`}
              >
                <button
                  onClick={() => toggleHabitLog(habit.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                    isCompleted
                      ? `bg-gradient-to-b ${habit.color} shadow-lg`
                      : "bg-gray-800"
                  }`}
                >
                  {isCompleted ? "✓" : habit.icon}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "text-green-400" : "text-white"}`}>
                    {habit.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {streak > 0 ? `🔥 ต่อเนื่อง ${streak} วัน` : "ยังไม่เริ่ม"}
                  </p>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-600 hover:text-red-400 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
