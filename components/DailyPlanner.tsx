"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Task {
  id: string;
  title: string;
  time: string;
  category: "study" | "work" | "personal" | "health";
  completed: boolean;
  date: string;
}

const CATEGORIES = {
  study: { label: "เรียน", color: "bg-blue-100 text-blue-700" },
  work: { label: "งาน", color: "bg-purple-100 text-purple-700" },
  personal: { label: "ส่วนตัว", color: "bg-green-100 text-green-700" },
  health: { label: "สุขภาพ", color: "bg-orange-100 text-orange-700" },
};

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

function getLocalTasks(date: string): Task[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`tasks_${date}`);
  return data ? JSON.parse(data) : [];
}

function saveLocalTasks(date: string, tasks: Task[]) {
  localStorage.setItem(`tasks_${date}`, JSON.stringify(tasks));
}

export default function DailyPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newCategory, setNewCategory] = useState<Task["category"]>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("date", today)
        .order("time", { ascending: true });

      if (error) console.error("Error fetching tasks:", error);
      else setTasks(data || []);
    } else {
      setTasks(getLocalTasks(today));
    }
    setLoading(false);
  }

  async function addTask() {
    if (!newTask.trim()) return;
    setSaving(true);

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.trim(),
      time: newTime,
      category: newCategory,
      completed: false,
      date: today,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .insert([task])
        .select();

      if (error) console.error("Error adding task:", error);
      else if (data) setTasks([...tasks, data[0]].sort((a, b) => a.time.localeCompare(b.time)));
    } else {
      const updated = [...tasks, task].sort((a, b) => a.time.localeCompare(b.time));
      setTasks(updated);
      saveLocalTasks(today, updated);
    }

    setNewTask("");
    setSaving(false);
  }

  async function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", id);

      if (!error) {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
      }
    } else {
      const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      setTasks(updated);
      saveLocalTasks(today, updated);
    }
  }

  async function deleteTask(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (!error) setTasks(tasks.filter((t) => t.id !== id));
    } else {
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      saveLocalTasks(today, updated);
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">ความคืบหน้าวันนี้</span>
          <span className="text-sm font-bold text-primary-600">
            {completedCount}/{tasks.length} งาน
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">เพิ่มงานใหม่</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="จะทำอะไรดีน้า..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <div className="flex gap-2">
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t} น.
                </option>
              ))}
            </select>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Task["category"])}
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
            <button
              onClick={addTask}
              disabled={saving || !newTask.trim()}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">กำลังโหลด...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm">ยังไม่มีงานในวันนี้</p>
            <p className="text-xs mt-1">เพิ่มงานแรกของคุณด้านบนเลย!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 transition-all ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.completed
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-gray-300 hover:border-primary-400"
                }`}
              >
                {task.completed && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.completed ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{task.time} น.</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      CATEGORIES[task.category].color
                    }`}
                  >
                    {CATEGORIES[task.category].label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-300 hover:text-red-400 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
