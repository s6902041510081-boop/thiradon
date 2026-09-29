"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
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
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-[22px] mx-auto mb-5 flex items-center justify-center shadow-lg shadow-green-500/30">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold text-white">สร้างบัญชี</h1>
          <p className="text-gray-400 text-sm mt-1">เริ่มต้นจัดการชีวิตของคุณ</p>
        </div>

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
            <div className="h-px bg-gray-700 mx-4" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่าน"
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
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          มีบัญชีแล้ว?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </div>
  );
}
