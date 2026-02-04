"use client";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BarChart3, Users, Shield, TrendingUp, ArrowRight, LogOut } from "lucide-react";

export function AdminHomePage() {
  const navigate = useNavigate();

  // Save user type to localStorage when entering
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

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden relative flex flex-col"
    >
      {/* Accent Circles */}
      <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-100/30 rounded-full blur-3xl -z-10 translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#1E3A8A]/10 rounded-full blur-2xl -z-10 -translate-x-1/2 -translate-y-1/2" />

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 p-3 bg-white/80 hover:bg-blue-100 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group border border-blue-200"
      >
        <LogOut className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
      </button>

      {/* Main Content Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-2xl border-0 p-10 flex flex-col items-center gap-10">
          {/* Header Section */}
          <div className="text-center">
            <div className="inline-block mb-6 p-4 bg-blue-100/60 backdrop-blur rounded-2xl hover:bg-blue-200/80 transition-all">
              <Shield className="w-16 h-16 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 leading-tight">
              Admin Panel
            </h1>
            <p className="text-lg md:text-xl text-blue-400 mb-6">
              ระบบจัดการพัสดุ
            </p>
          </div>

          {/* Stats Preview */}
          <div className="grid md:grid-cols-3 gap-6 w-full">
            {[
              {
                icon: BarChart3,
                title: "Dashboard",
                desc: "ดูข้อมูลพัสดุแบบเรียลไทม์",
              },
              {
                icon: Users,
                title: "ติดตาม",
                desc: "ตรวจสอบสถานะพัสดุ",
              },
              {
                icon: TrendingUp,
                title: "สถิติ",
                desc: "วิเคราะห์ประสิทธิภาพ",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-blue-50/60 rounded-2xl border border-blue-200 hover:border-blue-400 hover:bg-blue-100/80 hover:scale-105 transition-all duration-300 group flex flex-col items-center text-center"
                >
                  <div className="inline-block p-3 bg-gradient-to-br from-orange-400/30 to-yellow-400/30 rounded-lg mb-4 group-hover:from-orange-400/50 group-hover:to-yellow-400/50 transition-all">
                    <Icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-blue-400 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleNavigate}
            className="group mt-4 px-10 py-4 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 flex items-center gap-3 text-lg"
          >
            เข้าสู่ระบบ Admin
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  );
}
