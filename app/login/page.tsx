"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* iOS-style header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-[22px] mx-auto mb-5 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-4xl">📅</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Life Scheduler</h1>
          <p className="text-gray-400 text-sm mt-1">เข้าสู่ระบบเพื่อจัดการชีวิตของคุณ</p>
        </div>

        {/* iOS-style form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-900 rounded-2xl p-2 space-y-px">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมล"
              className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3.5 rounded-xl text-sm focus:outline-none"
              required
            />
            <div className="h-px bg-gray-700 mx-4" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3.5 rounded-xl text-sm focus:outline-none"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          ยังไม่มีบัญชี?{" "}
          <a href="/signup" className="text-blue-400 hover:text-blue-300">
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </div>
  );
}
