"use client";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  BarChart3,
  Users,
  TrendingUp,
  ArrowRight,
  LogOut,
  Package,
} from "lucide-react";

export function AdminHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("lastUserType", "admin");
  }, []);

  const handleNavigate = () => {
    navigate("/login");
  };

  const handleBack = () => {
    localStorage.removeItem("lastUserType");
    navigate("/user-home");
  };

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard",
      desc: "ดูข้อมูลพัสดุแบบเรียลไทม์",
    },
    {
      icon: Users,
      title: "Tracking",
      desc: "ตรวจสอบสถานะพัสดุ",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      desc: "วิเคราะห์ประสิทธิภาพระบบ",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fdf6e9] via-[#f0f4ff] to-[#fef3e2] font-sans">
      {/* NAVBAR */}
      <header className="relative z-50 px-8 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        {/* LOGO */}
        <div
          onClick={() => navigate("/user-home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 bg-[#1E3A8A] rounded-xl shadow-lg shadow-[#1E3A8A]/20 transition-transform duration-300 group-hover:scale-110">
            <Package className="w-6 h-6 text-white" />
          </div>

          <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-blue-700 transition">
            SmartParcel Admin
          </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4 animate-pulse">
              ADMIN CONTROL PANEL
            </div>

            <h1 className="text-5xl font-extrabold leading-tight mb-4">
              จัดการระบบพัสดุ
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-orange-500 bg-[length:200%] bg-clip-text text-transparent animate-[gradientMove_5s_linear_infinite]">
                อย่างมืออาชีพ
              </span>
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              ตรวจสอบ ติดตาม และวิเคราะห์ข้อมูลพัสดุแบบเรียลไทม์
              ผ่านระบบ SmartParcel Admin Dashboard
            </p>

            {/* BUTTON */}
            <button
              onClick={handleNavigate}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-xl
              bg-gradient-to-r from-[#1E3A8A] via-blue-600 to-blue-500
              text-white font-semibold overflow-hidden
              shadow-lg shadow-blue-500/30
              transition-all duration-300
              hover:scale-110 hover:shadow-blue-500/50
              active:scale-95"
            >

              {/* sweep light */}
              <span
                className="absolute inset-0 pointer-events-none
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 group-hover:opacity-100
                -translate-x-full group-hover:translate-x-full
                transition duration-700"
              />

              <span className="relative z-10">
                เข้าสู่ระบบ Admin
              </span>

              <ArrowRight
                className="relative z-10 w-5 h-5
                transition-transform duration-300
                group-hover:translate-x-2"
              />

            </button>
          </div>

          {/* RIGHT CARDS */}
          <div className="grid gap-5">

            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group relative flex items-center gap-4 p-5 rounded-xl
                  bg-white border border-gray-200
                  shadow-sm
                  transition-all duration-300 ease-out
                  hover:shadow-xl
                  hover:-translate-y-2
                  hover:border-blue-400
                  cursor-pointer overflow-hidden"
                >

                  {/* sweep background */}
                  <span
                    className="absolute inset-0 pointer-events-none
                    opacity-0 group-hover:opacity-100
                    bg-gradient-to-r from-blue-50 via-white to-blue-50
                    transition duration-500"
                  />

                  {/* icon */}
                  <div
                    className="relative z-10 w-12 h-12 rounded-lg
                    bg-gradient-to-br from-blue-600 to-blue-700
                    flex items-center justify-center
                    transition duration-300
                    group-hover:scale-110
                    group-hover:rotate-6
                    group-hover:shadow-lg"
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* text */}
                  <div className="relative z-10">
                    <div
                      className="font-semibold text-gray-800
                      transition duration-300
                      group-hover:text-blue-700"
                    >
                      {item.title}
                    </div>

                    <div className="text-gray-500 text-sm">
                      {item.desc}
                    </div>
                  </div>

                  {/* glow border */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none
                    border border-blue-400/0
                    group-hover:border-blue-400/40
                    transition duration-300"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* extra animation style */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% }
            100% { background-position: 200% }
          }
        `}
      </style>
    </div>
  );
}