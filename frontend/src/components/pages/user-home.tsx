"use client";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Package, MapPin, LogIn, Sparkles, Star, Zap, CheckCircle2 } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* ── Typewriter Hook ── */
function useTypewriter(text: string, speed = 50, delay = 800) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || displayText.length >= text.length) return;
    const t = setTimeout(() => setDisplayText(text.slice(0, displayText.length + 1)), speed);
    return () => clearTimeout(t);
  }, [started, displayText, text, speed]);

  return displayText;
}

export function UserHomePage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Cursor glow
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 120, damping: 25 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 25 });

  // Typewriter
  const typedText = useTypewriter("ระบบสายพานส่งพัสดุอัตโนมัติ", 40, 1200);

  useEffect(() => { localStorage.setItem("lastUserType", "user"); }, []);

  const handleMouse = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

  const handleNavigate = () => navigate("/users");

  // Stagger variants
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#fdf6e9] via-[#f0f4ff] to-[#fef3e2] cursor-default overflow-hidden relative font-sans"
      onMouseMove={handleMouse}
    >
      {/* ── Cursor Glow ── */}
      <motion.div
        className="pointer-events-none fixed w-[400px] h-[400px] rounded-full -z-0"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Gradient mesh background ── */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-50/60 via-transparent to-blue-50/40" />
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-bl from-amber-100/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-tr from-indigo-100/25 to-transparent" />
      </div>

      {/* ── Soft glow orbs ── */}
      <motion.div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F59E0B]/12 rounded-full blur-[120px] -z-50 translate-y-1/3 -translate-x-1/4"
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1E3A8A]/10 rounded-full blur-[100px] -z-30 translate-y-1/4 -translate-x-1/4"
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-[80px] -z-30 -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-amber-200/20 rounded-full blur-[90px] -z-30" />
      <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] bg-sky-200/15 rounded-full blur-[70px] -z-30" />

      {/* ── Animated floating shapes ── */}
      {[
        { cls: "left-8 top-32 w-20 h-20 bg-orange-200/60 rounded-lg", dur: 4, delay: 0, rotate: 5 },
        { cls: "right-12 top-48 w-16 h-16 bg-blue-200/50 rounded-md", dur: 3.6, delay: 0.3, rotate: -4 },
        { cls: "left-[18%] bottom-28 w-14 h-14 bg-amber-100/50 rounded-full", dur: 5, delay: 1, rotate: 0 },
        { cls: "right-[20%] bottom-36 w-10 h-10 bg-indigo-100/40 rounded-xl", dur: 4.2, delay: 0.6, rotate: 10 },
        { cls: "left-[50%] top-24 w-8 h-8 bg-pink-100/40 rounded-full", dur: 3.5, delay: 1.2, rotate: -5 },
        { cls: "right-[35%] top-[75%] w-12 h-12 bg-cyan-100/30 rounded-lg", dur: 5.5, delay: 0.8, rotate: 8 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className={`absolute ${s.cls} shadow-lg -z-30`}
          animate={{ y: [0, -18, 0], rotate: [0, s.rotate, 0] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}

      {/* ── Particle dots ── */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-2 h-2 bg-[#F59E0B]/30 rounded-full -z-30"
          style={{ left: `${5 + i * 8}%`, top: `${12 + (i % 4) * 22}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        />
      ))}

      {/* ── Stars twinkling ── */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute -z-30"
          style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 30}%` }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          <Star className="w-3 h-3 text-amber-300/50 fill-amber-300/30" />
        </motion.div>
      ))}

      {/* ── Animated gradient lines ── */}
      <motion.div
        className="absolute inset-x-0 top-[42%] h-[2px] rounded-full opacity-25 -z-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), rgba(245,158,11,0.15), transparent)" }}
        animate={{ x: [-200, 200, -200] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-x-0 top-[60%] h-[1px] rounded-full opacity-20 -z-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.1), rgba(59,130,246,0.1), transparent)" }}
        animate={{ x: [200, -200, 200] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* ══════════════ Navigation Bar ══════════════ */}
      <nav className="relative z-30 px-8 py-5 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <motion.div 
            className="p-2 bg-[#1E3A8A] rounded-xl shadow-lg shadow-[#1E3A8A]/20"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Package className="w-6 h-6 text-white" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-slate-800">SmartParcel</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, color: "#F59E0B" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/admin-home")}
          className="flex items-center gap-2 px-4 py-2 text-[#1E3A8A] hover:text-[#F59E0B] text-sm font-semibold transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>เข้าสู่ระบบ Admin</span>
        </motion.button>
      </nav>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12">

          {/* ── Image Area ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex justify-center items-center shrink-0"
          >
            {/* Rotating rings */}
            <motion.div
              className="absolute w-[520px] h-[520px] rounded-full border-2 border-dashed border-orange-200/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-[450px] h-[450px] rounded-full border border-blue-200/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-[380px] h-[380px] rounded-full border border-dashed border-orange-100/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Orbiting dots */}
            {[0, 90, 180, 270].map((deg, i) => (
              <motion.div
                key={deg}
                className="absolute w-3 h-3 bg-[#FFD786] rounded-full shadow-lg shadow-orange-300/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "260px 0px", rotate: deg }}
              />
            ))}

            {/* Shadow under image */}
            <motion.div
              className="absolute bottom-6 w-[60%] h-14 bg-black/8 blur-2xl rounded-[100%]"
              animate={{ scaleX: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Main image */}
            <motion.img
              src="/images/delivery-attached.png"
              alt="Smart Delivery System"
              className="w-auto max-w-[550px] lg:max-w-[700px] h-auto object-contain z-10 drop-shadow-2xl"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = "https://img.icons8.com/color/96/000000/delivery.png"; }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating Tracking Badge */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-12 right-2 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl z-20 hidden xl:block border border-gray-100"
            >
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <MapPin className="w-5 h-5 fill-current" />
                </motion.div>
                <span className="text-xs font-bold text-slate-700">Tracking...</span>
              </div>
              {/* Mini progress bar */}
              <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                  animate={{ width: ["20%", "90%", "20%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {/* Zap badge */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-32 left-4 bg-gradient-to-br from-amber-50 to-orange-50 p-2 rounded-xl shadow-lg z-20 hidden xl:block border border-amber-100"
            >
              <div className="flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                </motion.div>
                <span className="text-[10px] font-bold text-amber-600">Fast!</span>
              </div>
            </motion.div>

            {/* Corner sparkle */}
            <motion.div
              className="absolute -top-4 -left-4 z-20"
              animate={{ rotate: [0, 180, 360], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-orange-300" />
            </motion.div>
          </motion.div>

          {/* ── Content Area ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 text-center lg:text-left flex flex-col justify-center relative z-50"
          >
            {/* Badge */}
            <motion.div variants={childVariants}>
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-bold tracking-wider uppercase rounded-full border border-orange-200"
                whileHover={{ scale: 1.05 }}
              >
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.span>
                Automated Parcel Conveyor System
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                </motion.span>
              </motion.span>
            </motion.div>

            {/* Heading with color animation */}
            <motion.div variants={childVariants}>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15]">
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  จัดการทุกพัสดุ
                </motion.span>
                <br />
                <span className="text-[#FF8C00] inline-block">
                  รวดเร็ว
                </span>{" "}
                <motion.span
                  className="text-[#1E3A8A] inline-block"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  ส่งถึงมือ
                </motion.span>
              </h1>
            </motion.div>

            {/* Typewriter description */}
            <motion.div variants={childVariants}>
              <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed tracking-tight">
                {typedText}
                <motion.span
                  className="inline-block w-[2px] h-5 bg-[#F59E0B] align-middle ml-0.5"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </p>
            </motion.div>

            {/* ── CTA Button ── */}
            <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                onClick={handleNavigate}
                whileHover={{ scale: 1.05, translateY: -4, boxShadow: "0 25px 50px rgba(245,158,11,0.35)" }}
                whileTap={{ scale: 0.96 }}
                className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold rounded-2xl shadow-lg shadow-[#F59E0B]/25 transition-all flex items-center justify-center gap-3 text-lg"
              >
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                />
                <span className="relative z-10">เริ่มส่งพัสดุเลย</span>
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>
            </motion.div>

            {/* ── Conveyor belt animation ── */}
            <motion.div
              variants={childVariants}
              className="flex items-center gap-3 justify-center lg:justify-start mt-2"
            >
              <div className="relative w-60 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <motion.div
                  className="absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-orange-400 via-orange-500 to-blue-500 rounded-full shadow-sm"
                  animate={{ x: ["-40px", "240px"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Conveyor belt dots */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1 w-[3px] h-[3px] bg-gray-300 rounded-full"
                    style={{ left: `${i * 10 + 5}%` }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">สายพานอัตโนมัติ</span>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}