"use client";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Package, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function UserHomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("lastUserType", "user");
  }, []);

  const handleNavigate = () => navigate("/users");

  return (
    // เปลี่ยนพื้นหลังเป็นโทนสว่างนวลๆ เพื่อให้รูป 3D ดูละมุนขึ้น
    <div className="min-h-screen bg-[#fcfdfe] cursor-default overflow-hidden relative font-sans">
      
      {/* ตกแต่งพื้นหลังด้วยวงกลมสีอ่อน */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1E3A8A]/8 rounded-full blur-3xl -z-10 translate-y-1/4 -translate-x-1/4" />

      {/* Animated background accents (subtle, minimal) */}
      <motion.div
        className="absolute left-8 top-32 w-20 h-20 bg-orange-100 rounded-lg shadow-xl opacity-80 -z-10"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-12 top-48 w-16 h-16 bg-blue-100 rounded-md shadow-lg opacity-75 -z-10"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />

      <motion.div
        className="absolute inset-x-0 top-[42%] h-1 rounded-full opacity-30 -z-20"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(59,130,246,0.12), rgba(255,255,255,0))" }}
        animate={{ x: [ -200, 200, -200 ] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Navigation Bar */}
      <nav className="relative z-30 px-8 py-5 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="p-2 bg-[#1E3A8A] rounded-xl shadow-lg shadow-[#1E3A8A]/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">SmartParcel</span>
        </motion.div>

      </nav>

      <main className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-100px)]">
        
        {/* Left: Image Area (ใส่รูป 3D ที่คุณต้องการ) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative order-2 lg:order-1 flex justify-center items-center"
        >
          {/* เงาด้านล่างรูปภาพเพิ่มมิติ */}
          <div className="absolute bottom-10 w-[60%] h-10 bg-black/5 blur-2xl rounded-[100%]" />
          
          <img
            src="/images/delivery-attached.png"
            alt="Smart Delivery System"
            className="w-full max-w-[550px] lg:max-w-[650px] h-auto object-contain z-10 drop-shadow-xl"
            onError={(e) => { e.currentTarget.src = 'https://img.icons8.com/color/96/000000/delivery.png'; }}
          />
          
          {/* Floating Badge เล็กๆ เพิ่มความน่ารัก */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 right-10 bg-white p-3 rounded-2xl shadow-xl z-20 hidden xl:block border border-gray-50"
          >
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <MapPin className="w-5 h-5 fill-current" />
              <span className="text-xs font-bold text-slate-700">Tracking...</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="order-1 lg:order-2 space-y-8 text-center lg:text-left"
        >
          <div className="space-y-5">
            <motion.span 
              className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold tracking-wider uppercase rounded-full border border-orange-200"
            >
              Automated Parcel Conveyor System
            </motion.span>
            
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15]">
                จัดการทุกพัสดุ <br />
                <span className="text-[#1E3A8A]">รวดเร็ว ส่งถึงมือ</span>
              </h1>
            
            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              ระบบสายพานส่งพัสดุอัตโนมัติ 
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <motion.button
              onClick={handleNavigate}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-2xl shadow-lg shadow-[#F59E0B]/20 transition-all flex items-center justify-center gap-3 text-lg"
            >
              เริ่มส่งพัสดุเลย <ArrowRight className="w-5 h-5" />
            </motion.button>
          
          </div>
        </motion.div>
      </main>
    </div>
  );
}