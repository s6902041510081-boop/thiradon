-- Life Scheduler Database Schema
-- Run this in your Supabase SQL Editor

-- Tasks table (Daily Planner)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'personal',
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💧',
  color TEXT DEFAULT 'bg-blue-500',
  target_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table (daily completion tracking)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for demo purposes - tighten in production)
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON habit_logs FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
