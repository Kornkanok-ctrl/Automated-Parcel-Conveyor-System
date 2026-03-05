"use client";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Package, MapPin, LogIn, Sparkles, Zap, CheckCircle2 } from "lucide-react";

export function UserHomePage() {
  const navigate = useNavigate();

  useEffect(() => { localStorage.setItem("lastUserType", "user"); }, []);

  const handleNavigate = () => navigate("/users");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6e9] via-[#f0f4ff] to-[#fef3e2] cursor-default overflow-hidden relative font-sans">

      {/* ── Gradient mesh background ── */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-50/60 via-transparent to-blue-50/40" />
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-bl from-amber-100/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-tr from-indigo-100/25 to-transparent" />
      </div>

      {/* ── Soft glow orbs ── */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F59E0B]/12 rounded-full blur-[120px] -z-50 translate-y-1/3 -translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1E3A8A]/10 rounded-full blur-[100px] -z-30 translate-y-1/4 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-[80px] -z-30 -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-amber-200/20 rounded-full blur-[90px] -z-30" />
      <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-sky-200/15 rounded-full blur-[70px] -z-30" />

      {/* ── Static decorative shapes ── */}
      <div className="absolute left-8 top-32 w-20 h-20 bg-orange-200/60 rounded-lg shadow-lg -z-30" />
      <div className="absolute right-12 top-48 w-16 h-16 bg-blue-200/50 rounded-md shadow-lg -z-30" />
      <div className="absolute left-[18%] bottom-28 w-14 h-14 bg-amber-100/50 rounded-full shadow-lg -z-30" />
      <div className="absolute right-[20%] bottom-36 w-10 h-10 bg-indigo-100/40 rounded-xl shadow-lg -z-30" />
      <div className="absolute left-[50%] top-24 w-8 h-8 bg-pink-100/40 rounded-full shadow-lg -z-30" />
      <div className="absolute right-[35%] top-[75%] w-12 h-12 bg-cyan-100/30 rounded-lg shadow-lg -z-30" />

      {/* ══════════════ Navigation Bar ══════════════ */}
      <header className="relative z-50 px-8 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#1E3A8A] rounded-xl shadow-lg shadow-[#1E3A8A]/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">SmartParcel</span>
        </div>

        <button
          onClick={() => navigate("/admin-home")}
          className="flex items-center gap-2 px-4 py-2 text-[#1E3A8A] hover:text-[#F59E0B] text-sm font-semibold transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>เข้าสู่ระบบ Admin</span>
        </button>
      </header>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12">

          {/* ── Image Area ── */}
          <div className="relative flex justify-center items-center shrink-0">
            {/* Static rings */}
            <div className="absolute w-[520px] h-[520px] rounded-full border-2 border-dashed border-orange-200/40" />
            <div className="absolute w-[450px] h-[450px] rounded-full border border-blue-200/30" />
            <div className="absolute w-[380px] h-[380px] rounded-full border border-dashed border-orange-100/25" />

            {/* Shadow under image */}
            <div className="absolute bottom-6 w-[60%] h-14 bg-black/8 blur-2xl rounded-[100%]" />

            {/* Main image */}
            <img
              src="/images/delivery-attached.png"
              alt="Smart Delivery System"
              className="w-auto max-w-[550px] lg:max-w-[700px] h-auto object-contain z-10 drop-shadow-2xl"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = "https://img.icons8.com/color/96/000000/delivery.png"; }}
            />

            {/* Floating Tracking Badge */}
            <div className="absolute top-12 right-2 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl z-20 hidden xl:block border border-gray-100">
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <MapPin className="w-5 h-5 fill-current" />
                <span className="text-xs font-bold text-slate-700">Tracking...</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[60%] bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
              </div>
            </div>

            {/* Zap badge */}
            <div className="absolute top-32 left-4 bg-gradient-to-br from-amber-50 to-orange-50 p-2 rounded-xl shadow-lg z-20 hidden xl:block border border-amber-100">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-[10px] font-bold text-amber-600">Fast!</span>
              </div>
            </div>

            {/* Corner sparkle */}
            <div className="absolute -top-4 -left-4 z-20">
              <Sparkles className="w-6 h-6 text-orange-300" />
            </div>
          </div>

          {/* ── Content Area ── */}
          <div className="space-y-5 text-center lg:text-left flex flex-col justify-center relative z-50">
            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-bold tracking-wider uppercase rounded-full border border-orange-200">
                <Sparkles className="w-3.5 h-3.5" />
                Automated Parcel Conveyor System
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              </span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15]">
                <span className="inline-block">จัดการทุกพัสดุ</span>
                <br />
                <span className="text-[#FF8C00] inline-block">รวดเร็ว</span>{" "}
                <span className="text-[#1E3A8A] inline-block">ส่งถึงมือ</span>
              </h1>
            </div>

            {/* Description */}
            <div>
              <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed tracking-tight">
                ระบบสายพานส่งพัสดุอัตโนมัติ
              </p>
            </div>

            {/* ── CTA Button ── */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleNavigate}
                className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-2xl shadow-lg shadow-[#F59E0B]/25 transition-all hover:scale-105 hover:-translate-y-1 hover:shadow-xl active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                <span className="relative z-10">เริ่มส่งพัสดุเลย</span>
                <span className="relative z-10">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </div>

            {/* ── Conveyor belt static ── */}
            <div className="flex items-center gap-3 justify-center lg:justify-start mt-2">
              <div className="relative w-60 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div className="absolute top-0 left-1/3 h-full w-10 bg-gradient-to-r from-orange-400 via-orange-500 to-blue-500 rounded-full shadow-sm" />
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1 w-[3px] h-[3px] bg-gray-300 rounded-full"
                    style={{ left: `${i * 10 + 5}%` }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">สายพานอัตโนมัติ</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}