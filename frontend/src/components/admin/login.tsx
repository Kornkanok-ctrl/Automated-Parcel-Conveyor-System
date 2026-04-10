"use client";

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "../../services/api";
import { div } from "framer-motion/m";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // console.log('Attempting login with:', { username, hasPassword: !!password });
      
      const response = await apiService.adminLogin({ username, password });
      
      // console.log('Login response:', response);
      
      if (response.success) {
        // console.log('Login successful, token stored');
        onLogin();
        navigate("/dashboard");
      } else {
        setError(response.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (error) {
      // console.error("Admin login error:", error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fdf6e9] via-[#f0f4ff] to-[#fef3e2] font-sans">

      {/* NAVBAR */}
      <header className="relative z-50 px-8 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        {/* LOGO */}
        <div
          onClick={() => navigate("/admin-home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 bg-[#1E3A8A] rounded-xl shadow-lg shadow-[#1E3A8A]/20 transition-transform duration-300 group-hover:scale-110">
            <Package className="w-6 h-6 text-white" />
          </div>

          <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-blue-700 transition">
            SmartParcel Login
          </span>
        </div>
      </header>

    {/* LOGIN SECTION */}
    <main className="
      relative
      flex flex-1
      items-center justify-center
      px-4 sm:px-6 lg:px-8
      py-10 sm:py-12
    ">

      {/* Glow background */}
      <div className="
        absolute
        left-1/2 top-1/2
        -translate-x-1/2 -translate-y-1/2
        w-[400px] h-[400px] sm:w-[500px] sm:h-[500px]
        bg-gradient-to-br
        from-blue-200/40 to-orange-200/40
        blur-3xl
        rounded-full
      " />

      {/* Card */}
      <Card className="
        relative
        w-full
        max-w-md
        p-6 sm:p-8

        bg-white/60 backdrop-blur-xl
        border border-white/40
        rounded-2xl

        shadow-[0_10px_30px_-10px_rgba(30,58,138,0.15)]

        transition-all duration-500

        hover:shadow-[0_15px_40px_-10px_rgba(30,58,138,0.20)]
        hover:-translate-y-1
      ">

        <CardHeader className="text-center space-y-4 pb-6">

          <div className="
            mx-auto
            flex h-20 w-20
            items-center justify-center
            rounded-2xl
            bg-gradient-to-br from-blue-600 to-blue-400
            shadow-lg shadow-blue-300/40
            transition-all duration-500
            hover:scale-110 hover:rotate-6
          ">
            <Lock className="h-9 w-9 text-white animate-pulse" />
          </div>

          <CardTitle className="text-3xl font-bold text-blue-900">
            Admin Login
          </CardTitle>

          <CardDescription className="text-blue-500">
            กรุณากรอก Username และ Password
          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-5">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div className="space-y-2">

              <Label className="text-blue-900 font-medium">
                Username
              </Label>

              <div className="relative group">

                <User className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  h-4 w-4 text-blue-400
                  group-focus-within:text-blue-600
                " />

                <Input
                  type="text"
                  placeholder="กรอก Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="
                    pl-10 h-12
                    bg-white/70
                    border border-blue-200
                    rounded-xl
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200
                  "
                />

              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">

              <Label className="text-blue-900 font-medium">
                Password
              </Label>

              <div className="relative group">

                <Lock className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  h-4 w-4 text-blue-400
                " />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอก Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="
                    pl-10 pr-10 h-12
                    bg-white/70
                    border border-blue-200
                    rounded-xl
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-200
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-blue-400 hover:text-blue-700
                  "
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>

              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="
                bg-red-50 border border-red-200
                text-red-600
                p-3 rounded-xl text-sm
              ">
                {error}
              </div>
            )}

            {/* Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="
                w-full h-12
                rounded-xl
                bg-gradient-to-r from-orange-400 to-yellow-400
                hover:from-orange-500 hover:to-yellow-500
                text-white font-bold
                shadow-lg shadow-orange-200/50
              "
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>

          </form>

        </CardContent>

      </Card>

    </main>

  </div>
);
}