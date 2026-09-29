"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  target_days: number;
}

interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

const HABIT_ICONS = ["💧", "📚", "🏃", "🧘", "😴", "🥗", "✍️", "🎵", "🚶", "💊"];
const HABIT_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-red-500",
];

function getLocalHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("habits");
  return data ? JSON.parse(data) : [];
}

function saveLocalHabits(habits: Habit[]) {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function getLocalLogs(): HabitLog[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("habit_logs");
  return data ? JSON.parse(data) : [];
}

function saveLocalLogs(logs: HabitLog[]) {
  localStorage.setItem("habit_logs", JSON.stringify(logs));
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("💧");
  const [newHabitColor, setNewHabitColor] = useState("bg-blue-500");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);

  async function fetchHabits() {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("habits").select("*").order("created_at", { ascending: true });
      if (error) console.error("Error fetching habits:", error);
      else setHabits(data || []);
    } else {
      setHabits(getLocalHabits());
    }
    setLoading(false);
  }

  async function fetchLogs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("habit_logs").select("*").eq("date", today);
      if (error) console.error("Error fetching logs:", error);
      else setLogs(data || []);
    } else {
      setLogs(getLocalLogs().filter((l) => l.date === today));
    }
  }

  async function addHabit() {
    if (!newHabitName.trim()) return;
    setSaving(true);

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
      icon: newHabitIcon,
      color: newHabitColor,
      target_days: 7,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("habits")
        .insert([habit])
        .select();

      if (error) console.error("Error adding habit:", error);
      else if (data) setHabits([...habits, data[0]]);
    } else {
      const updated = [...habits, habit];
      setHabits(updated);
      saveLocalHabits(updated);
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
    } else {
      const allLogs = getLocalLogs();
      if (existingLog) {
        const updated = allLogs.map((l) =>
          l.id === existingLog.id ? { ...l, completed: !l.completed } : l
        );
        saveLocalLogs(updated);
        setLogs(updated.filter((l) => l.date === today));
      } else {
        const newLog: HabitLog = {
          id: crypto.randomUUID(),
          habit_id: habitId,
          date: today,
          completed: true,
        };
        const updated = [...allLogs, newLog];
        saveLocalLogs(updated);
        setLogs([...logs, newLog]);
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
    } else {
      const updatedHabits = habits.filter((h) => h.id !== id);
      setHabits(updatedHabits);
      saveLocalHabits(updatedHabits);
      const allLogs = getLocalLogs();
      const updatedLogs = allLogs.filter((l) => l.habit_id !== id);
      saveLocalLogs(updatedLogs);
      setLogs(updatedLogs.filter((l) => l.date === today));
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
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">นิสัยที่ทำสำเร็จวันนี้</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {completedToday}
              <span className="text-lg text-gray-400 font-normal">/{habits.length}</span>
            </p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
      </div>

      {/* Add Habit Form */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">เพิ่มนิสัยใหม่</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="เช่น ดื่มน้ำ อ่านหนังสือ ออกกำลังกาย..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 flex-wrap">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewHabitIcon(icon)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    newHabitIcon === icon ? "bg-primary-100 ring-2 ring-primary-500" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1.5">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewHabitColor(color)}
                  className={`w-7 h-7 rounded-full ${color} transition-all ${
                    newHabitColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                />
              ))}
            </div>
            <button
              onClick={addHabit}
              disabled={saving || !newHabitName.trim()}
              className="ml-auto px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">กำลังโหลด...</div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-sm">ยังไม่มีนิสัยที่ติดตาม</p>
            <p className="text-xs mt-1">เริ่มสร้างนิสัยแรกของคุณเลย!</p>
          </div>
        ) : (
          habits.map((habit) => {
            const log = logs.find((l) => l.habit_id === habit.id && l.date === today);
            const isCompleted = log?.completed || false;
            const streak = getStreak(habit.id);

            return (
              <div
                key={habit.id}
                className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 transition-all ${
                  isCompleted ? "bg-green-50/50" : ""
                }`}
              >
                <button
                  onClick={() => toggleHabitLog(habit.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    isCompleted
                      ? `${habit.color} text-white shadow-md`
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {isCompleted ? "✓" : habit.icon}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? "text-green-700" : "text-gray-800"}`}>
                    {habit.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {streak > 0 ? `🔥 ต่อเนื่อง ${streak} วัน` : "ยังไม่เริ่ม"}
                  </p>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1"
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
