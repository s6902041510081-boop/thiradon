"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

interface Task {
  id: string;
  title: string;
  time: string;
  category: "study" | "work" | "personal" | "health";
  completed: boolean;
  date: string;
  user_id?: string;
}

const CATEGORIES = {
  study: { label: "เรียน", color: "bg-blue-500/20 text-blue-400" },
  work: { label: "งาน", color: "bg-purple-500/20 text-purple-400" },
  personal: { label: "ส่วนตัว", color: "bg-green-500/20 text-green-400" },
  health: { label: "สุขภาพ", color: "bg-orange-500/20 text-orange-400" },
};

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

export default function DailyPlanner() {
  const { user } = useAuth();
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
    if (isSupabaseConfigured && supabase && user) {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("date", today)
        .eq("user_id", user.id)
        .order("time", { ascending: true });

      if (error) console.error("Error fetching tasks:", error);
      else setTasks(data || []);
    }
    setLoading(false);
  }

  async function addTask() {
    if (!newTask.trim() || !user) return;
    setSaving(true);

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.trim(),
      time: newTime,
      category: newCategory,
      completed: false,
      date: today,
      user_id: user.id,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .insert([task])
        .select();

      if (error) console.error("Error adding task:", error);
      else if (data) setTasks([...tasks, data[0]].sort((a, b) => a.time.localeCompare(b.time)));
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
    }
  }

  async function deleteTask(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (!error) setTasks(tasks.filter((t) => t.id !== id));
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Progress Card */}
      <div className="ios-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">ความคืบหน้าวันนี้</span>
          <span className="text-sm font-semibold text-white">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      <div className="ios-card p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">เพิ่มงานใหม่</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="จะทำอะไรดีน้า..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3.5 rounded-xl text-sm focus:outline-none"
          />
          <div className="flex gap-2">
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-3 py-3 rounded-xl text-sm focus:outline-none border border-gray-700"
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
              className="flex-1 bg-gray-800 text-white px-3 py-3 rounded-xl text-sm focus:outline-none border border-gray-700"
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
              className="ios-press px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-40"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-gray-400 text-sm">ยังไม่มีงานในวันนี้</p>
            <p className="text-gray-600 text-xs mt-1">เพิ่มงานแรกของคุณด้านบนเลย!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`ios-card p-4 flex items-center gap-3 ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.completed
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-600"
                }`}
              >
                {task.completed && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.completed ? "line-through text-gray-500" : "text-white"
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{task.time} น.</span>
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
                className="text-gray-600 hover:text-red-400 p-1"
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
