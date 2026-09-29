# Life Scheduler — แอปจัดตารางเวลาชีวิต

แอปพลิเคชันสำหรับจัดการตารางเวลาชีวิต วางแผนงานรายวัน และติดตามนิสัยประจำวัน

## Features

- **Daily Planner** — วางแผนงานรายวัน พร้อมจัดหมวดหมู่ (เรียน, งาน, ส่วนตัว, สุขภาพ) และติดตามความคืบหน้า
- **Habit Tracker** — ติดตามนิสัยประจำวัน พร้อมระบบ streak และสรุปผลรายวัน
- **Supabase Backend** — ฐานข้อมูล Real-time ที่ซิงก์ข้อมูลอัตโนมัติ
- **Minimal & Clean UI** — ออกแบบเรียบง่าย ใช้งานง่าย

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Language:** TypeScript
- **Deployment:** Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd life-scheduler
npm install
```

### 2. Setup Supabase

1. ไปที่ [supabase.com](https://supabase.com) สร้างโปรเจกต์ใหม่
2. ไปที่ **SQL Editor** แล้วรันคำสั่งในไฟล์ `supabase-schema.sql`
3. คัดลอก **Project URL** และ **anon public key** จาก Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
```

แก้ไขค่าใน `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Deployment on Vercel

1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → **Add New Project**
3. Import repo จาก GitHub
4. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. กด **Deploy**

## Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DailyPlanner.tsx
│   ├── HabitTracker.tsx
│   └── Header.tsx
├── lib/
│   └── supabase.ts
├── supabase-schema.sql
├── .env.example
└── README.md
```

## License

MIT
