"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  Phone,
  Home,
  Truck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { useRecipients, useDeliveryCompanies } from "../../hooks/useApi";
import { apiService, type Recipient, type DeliveryCompany } from "../../services/api";

interface SenderFlowProps {
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4;

export function SenderFlow({ onBack }: SenderFlowProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRoom, setSelectedRoom] = useState<Recipient | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<DeliveryCompany | null>(null);
  const [phoneDigits, setPhoneDigits] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdParcel, setCreatedParcel] = useState<any>(null);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showLockPopup, setShowLockPopup] = useState(false);
  const [lockLevel, setLockLevel] = useState(0);
    // ผิด 1 ครั้ง = ล็อค 1 นาที
    // ผิด 2 ครั้ง = ล็อค 5 นาที
    // ผิด 3+ ครั้ง = ล็อค 15 นาทีคงที่ตลอดไป (ไม่เพิ่มขึ้นแล้ว)

  // API hooks
  const { recipients, recipientsByFloor, loading: recipientsLoading, error: recipientsError } = useRecipients();
  const { deliveryCompanies, loading: companiesLoading, error: companiesError } = useDeliveryCompanies();

  // ดึง 6 หลักแรกจาก backend และให้ผู้ใช้กรอก 4 หลักสุดท้าย
  const getPhonePrefix = (room: Recipient | null) => {
    if (!room?.phone) return '';
    return room.phone.replace(/\D/g, '').slice(0, 6);
  };

  const getPhoneLast4 = (room: Recipient | null) => {
    if (!room?.phone) return '';
    return room.phone.replace(/\D/g, '').slice(6, 10);
  };

  // Validate: เช็คว่า 4 หลักที่ผู้ใช้กรอกตรงกับฐานข้อมูล
  const validatePhoneNumber = (inputLast4: string, selectedRoom: Recipient) => {
    if (!inputLast4 || inputLast4.length !== 4 || !selectedRoom?.phone) {
      return false;
    }
    const roomLast4 = getPhoneLast4(selectedRoom);
    return inputLast4 === roomLast4;
  };

  // เพิ่ม gradient background และ floating accent (เหมือน user-home)
  // const bgClass = "min-h-screen bg-gradient-to-br from-[#fdf6e9] via-[#f0f4ff] to-[#fef3e2] cursor-default overflow-hidden relative font-sans";
  const bgClass = "h-screen bg-gradient-to-br from-[#fdf6e9] via-[#f0f4ff] to-[#fef3e2] overflow-hidden flex flex-col relative font-sans";
  const accentCircles = (
    <>
      {/* CSS keyframes for floating animations */}
      <style>{`
        @keyframes floatSlow { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-18px) rotate(6deg); } }
        @keyframes floatMed  { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-12px) rotate(-4deg); } }
        @keyframes pulseSoft { 0%,100%{ opacity:0.5; transform:scale(1); } 50%{ opacity:0.8; transform:scale(1.08); } }
        @keyframes driftRight { 0%{ transform:translateX(-100%); opacity:0; } 50%{ opacity:0.35; } 100%{ transform:translateX(100vw); opacity:0; } }
      `}</style>

      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-50/60 via-transparent to-blue-50/40" />
        <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-bl from-amber-100/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-tr from-indigo-100/25 to-transparent" />
      </div>

      {/* Strong glow orbs — blue & yellow */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-[#F59E0B]/20 rounded-full blur-[160px] -z-50" />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-[#1E3A8A]/15 rounded-full blur-[140px] -z-50" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-300/15 rounded-full blur-[120px] -z-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/12 rounded-full blur-[110px] -z-40 translate-y-1/4 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-yellow-200/20 rounded-full blur-[90px] -z-30 -translate-x-1/2" />

      {/* Floating decorative shapes */}
      <div className="absolute left-[6%] top-28 w-20 h-20 bg-gradient-to-br from-orange-300/70 to-yellow-300/70 rounded-xl shadow-xl -z-10" style={{ animation: 'floatSlow 6s ease-in-out infinite' }} />
      <div className="absolute right-[8%] top-44 w-16 h-16 bg-gradient-to-br from-blue-400/60 to-indigo-400/60 rounded-lg shadow-xl -z-10" style={{ animation: 'floatMed 5s ease-in-out infinite 0.5s' }} />
      <div className="absolute left-[15%] bottom-24 w-14 h-14 bg-gradient-to-br from-amber-300/60 to-orange-300/60 rounded-full shadow-xl -z-10" style={{ animation: 'floatSlow 7s ease-in-out infinite 1s' }} />
      <div className="absolute right-[12%] bottom-40 w-12 h-12 bg-gradient-to-br from-sky-300/60 to-blue-400/60 rounded-md shadow-xl -z-10" style={{ animation: 'floatMed 5.5s ease-in-out infinite 0.3s' }} />
      <div className="absolute left-[50%] top-20 w-10 h-10 bg-gradient-to-br from-yellow-300/50 to-amber-400/50 rounded-lg shadow-lg -z-10" style={{ animation: 'floatSlow 8s ease-in-out infinite 2s' }} />

      {/* Animated gradient line sliding across */}
      <div className="absolute top-[30%] left-0 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent -z-10" style={{ animation: 'driftRight 12s linear infinite' }} />
      <div className="absolute top-[65%] left-0 w-36 h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent -z-10" style={{ animation: 'driftRight 15s linear infinite 4s' }} />

      {/* Particle dots */}
      {[
        { top: '12%', left: '20%', size: 6, color: 'bg-amber-400/40', delay: '0s', dur: '4s' },
        { top: '25%', left: '80%', size: 5, color: 'bg-blue-400/40', delay: '1s', dur: '5s' },
        { top: '55%', left: '10%', size: 7, color: 'bg-orange-300/40', delay: '2s', dur: '6s' },
        { top: '70%', left: '75%', size: 5, color: 'bg-indigo-300/35', delay: '0.5s', dur: '4.5s' },
        { top: '40%', left: '90%', size: 6, color: 'bg-yellow-400/35', delay: '1.5s', dur: '5.5s' },
        { top: '85%', left: '45%', size: 4, color: 'bg-blue-300/30', delay: '3s', dur: '7s' },
      ].map((dot, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${dot.color} -z-10`}
          style={{
            top: dot.top, left: dot.left,
            width: dot.size, height: dot.size,
            animation: `pulseSoft ${dot.dur} ease-in-out infinite ${dot.delay}`,
          }}
        />
      ))}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 -z-10">
        <div className="absolute top-4 left-4 w-12 h-[3px] bg-gradient-to-r from-amber-400/60 to-transparent rounded-full" />
        <div className="absolute top-4 left-4 w-[3px] h-12 bg-gradient-to-b from-amber-400/60 to-transparent rounded-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 -z-10">
        <div className="absolute bottom-4 right-4 w-12 h-[3px] bg-gradient-to-l from-blue-400/60 to-transparent rounded-full" />
        <div className="absolute bottom-4 right-4 w-[3px] h-12 bg-gradient-to-t from-blue-400/60 to-transparent rounded-full" />
      </div>
    </>
  );

  useEffect(() => {
    if (!selectedRoom) return;
    if (phoneDigits.length !== 4) return;

    if (!validatePhoneNumber(phoneDigits, selectedRoom)) {
      setFailedAttempts((prev) => {
        const newAttempts = prev + 1;

        if (newAttempts >= 5) {
          const newLevel = lockLevel + 1;
          const lockMinutes = getLockDurationMinutes(newLevel);
          const seconds = lockMinutes * 60;

          setLockLevel(newLevel);
          setRemainingSeconds(seconds);
          setShowLockPopup(true);

          return 0;
        }

        return newAttempts;
      });
    } else {
      setFailedAttempts(0);
    }
  }, [phoneDigits]);

  useEffect(() => {
    if (!showLockPopup) return;

    if (remainingSeconds <= 0) {
      setShowLockPopup(false);
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowLockPopup(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showLockPopup]);

  useEffect(() => {
    // ไม่ทำงานระหว่าง lock popup
    if (showLockPopup) return;

    const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 นาที 
    // const INACTIVITY_LIMIT = 5000; // 5 วินาที (สำหรับทดสอบ)
    let timeoutId: ReturnType<typeof setTimeout>;

    const logoutToHome = () => {
      handleFullReset();
      navigate("/user-home");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutToHome, INACTIVITY_LIMIT);
    };

    const activityEvents: (keyof WindowEventMap)[] = [
      "click",
      "touchstart",
      "mousemove",
      "keydown",
      "scroll"
    ];

    // เริ่ม inactivity ใหม่ทันทีหลัง popup ปิด
    resetTimer();

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };

    // ต้องมี showLockPopup เพื่อ restart timer หลัง lock หมด
  }, [navigate, showLockPopup]);

  const handlePhoneValidation = () => {
    if (!selectedRoom) return;

    if (!validatePhoneNumber(phoneDigits, selectedRoom)) {
      return;
    }

    goToNextStep();
  };

  const getLockDurationMinutes = (level: number) => {
    if (level === 1) return 1;
    if (level === 2) return 5;
    return 15;
  };

  const steps = [
    { number: 1, title: "เลือกเลขห้อง", icon: Home },
    { number: 2, title: "ยืนยันเบอร์โทรศัพท์ผู้รับ", icon: Phone },
    { number: 3, title: "เลือกบริษัทขนส่ง", icon: Truck },
    { number: 4, title: "ยืนยันข้อมูล", icon: Check },
  ];

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
      setSubmitError(null);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRoom || !selectedCourier) return;

    setSubmitError(null);
    setIsSubmitting(true);
    setShowProcessingPopup(true);

    try {
      const parcelData = {
        roomNumber: selectedRoom.roomNumber,
        deliveryCompany: selectedCourier.name,
      };

      const response = await apiService.createParcel(parcelData);

      if (response.success) {
        setTimeout(() => {
          setShowProcessingPopup(false);
          setCreatedParcel(response.parcel);
          setIsComplete(true);
          setIsSubmitting(false);
        }, 3000);
      } else {
        setShowProcessingPopup(false);
        setSubmitError(response.message || 'เกิดข้อผิดพลาดในการส่งพัสดุ');
        setIsSubmitting(false);
      }

    } catch (error) {
      setShowProcessingPopup(false);
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งพัสดุ');
      setIsSubmitting(false);
    }
  };

  const handleFullReset = () => {
    setCurrentStep(1);
    setSelectedRoom(null);
    setSelectedCourier(null);
    setPhoneDigits("");
    setIsComplete(false);
    setSubmitError(null);
    setCreatedParcel(null);
    setShowProcessingPopup(false);

    // reset security
    setFailedAttempts(0);
    setLockLevel(0);
  };

  const formatPhoneNumber = (phone: string) => {
    const only = phone.replace(/\D/g, "");
    if (only.length <= 3) return only;
    if (only.length <= 6) return `${only.slice(0,3)}-${only.slice(3)}`;
    return `${only.slice(0,3)}-${only.slice(3,6)}-${only.slice(6,10)}`.slice(0, 13);
  };

  const displayPhone = phoneDigits || selectedRoom?.phone || "";

  // Derived phone values
  const phonePrefix = getPhonePrefix(selectedRoom);
  const requiredLast4 = getPhoneLast4(selectedRoom);
  const fullPhoneNumber = phonePrefix + phoneDigits;
  const isPhoneValid = selectedRoom ? validatePhoneNumber(phoneDigits, selectedRoom) : false;

  // Loading states
  if (recipientsLoading || companiesLoading) {
    return (
      <div className={bgClass}>
        {accentCircles}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white/90 rounded-2xl shadow-xl px-10 py-12 max-w-md w-full flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">กำลังโหลดข้อมูล...</h2>
            <p className="text-gray-500 text-center">กรุณารอสักครู่</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (recipientsError || companiesError) {
    return (
      <div className={bgClass}>
        {accentCircles}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white/90 rounded-2xl shadow-xl px-10 py-12 max-w-md w-full flex flex-col items-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-500 text-center mb-4">
              {recipientsError || companiesError}
            </p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 text-white">
              โหลดใหม่
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={bgClass}>
      {accentCircles}
      {/* ══════════════ Navigation Bar ══════════════ */}
      <header className="relative z-50 px-8 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/user-home')}
          >
          {/*logo*/}
          <div className="p-2 bg-[#1E3A8A] rounded-xl shadow-lg shadow-[#1E3A8A]/20 transition-transform duration-300 group-hover:scale-110">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-blue-700 transition">
            SmartParcel
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="mb-4 flex items-center justify-between rounded-xl bg-white/70 backdrop-blur-md border border-blue-100 shadow-lg px-8 py-3">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center whitespace-nowrap">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 shadow-lg ${
                  currentStep > step.number
                    ? "bg-gradient-to-br from-orange-400 to-yellow-400 text-white shadow-orange-300/40"
                    : currentStep === step.number
                      ? "bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-blue-400/40 ring-2 ring-blue-200/50"
                      : "bg-blue-50 text-blue-300 shadow-none"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="text-lg">{step.number}</span>
                )}
              </div>
              <span
                className={`ml-2 hidden text-sm font-semibold md:block transition-colors whitespace-nowrap ${
                  currentStep >= step.number
                    ? "text-blue-900"
                    : "text-blue-300"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-1.5 w-8 rounded-full md:w-16 transition-colors duration-300 ${
                    currentStep > step.number ? "bg-gradient-to-r from-orange-400 to-amber-400" : "bg-blue-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <Card className="shadow-2xl border border-blue-100/60 bg-white/85 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-orange-400" />
          <CardHeader className="pt-5 pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-sm text-white shadow-lg shadow-blue-400/30">
                  {currentStep}
                </span>
                <span className="text-blue-900 text-lg">{steps[currentStep - 1]?.title}</span>
              </div>
              {/* Show room info only on step 2-3 */}
              {currentStep >= 2 && currentStep <= 3 && selectedRoom && (
                <div className="flex items-center gap-2 bg-blue-100/70 rounded-lg px-4 py-1.5">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-500">ห้อง</span>
                  <span className="text-xl font-extrabold text-blue-900">{selectedRoom.roomNumber}</span>
                  <span className="text-sm text-blue-600">{selectedRoom.name}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>

            {/* Step 1: Select Room */}
            {currentStep === 1 && (
              <div className="space-y-4 "> 
                <p className="text-blue-400 text-base mb-3">กรุณาเลือกเลขห้องผู้รับพัสดุ</p>
                
                <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-100/80 via-sky-50/60 to-amber-100/70 p-3 shadow-lg">
                  {Object.keys(recipientsByFloor).map((floor) => {
                    const isFloorDisabled = floor !== '1';
                    return (
                      <div key={floor} className="mt-4 mb-3 first:mt-0">
                        <h4 className="mb-2 mt-2 text-sm font-semibold text-blue-500 text-center tracking-wide">ชั้น {floor}</h4>
                        <div className="flex flex-wrap justify-center gap-5">
                          {recipientsByFloor[floor]?.map((room) => {
                            const isSelected = !isFloorDisabled && selectedRoom?.id === room.id;
                            return (
                              <button
                                key={room.id}
                                onClick={() => !isFloorDisabled && setSelectedRoom(room)}
                                className={`rounded-xl border-2 py-3 px-6 text-center transition-all duration-200 shadow-md w-24 ${
                                  isFloorDisabled
                                    ? 'border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : isSelected
                                      ? 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-500 text-white scale-105 shadow-blue-400/30'
                                      : 'border-blue-200 bg-white text-blue-900 hover:bg-blue-50/60 hover:shadow-lg hover:border-blue-500 hover:-translate-y-0.5'
                                }`}
                              >
                                <div className="text-xl font-bold">{room.roomNumber}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Phone Input — 6 หลักแรกจาก backend, ผู้ใช้กรอก 4 หลักสุดท้าย */}
            {currentStep === 2 && selectedRoom && (
              <div className="space-y-2">
                <p className="text-red-500 text-left text-base font-medium">กรุณายืนยันตัวตนด้วยหมายเลข (4 หลักสุดท้าย)</p>
                <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-100/80 via-sky-50/60 to-amber-100/70 p-4 shadow-lg flex flex-col justify-center">
                  {/* Phone display */}
                  <div className="flex justify-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-white/80 shadow-sm border border-blue-100">
                      <span className="text-blue-400 text-sm font-medium">+66</span>
                      <div className="flex items-center gap-1">
                        {/* 6 หลักแรก — ดึงจาก backend */}
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="flex h-10 w-9 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-base font-bold text-blue-700">
                              {phonePrefix[i] ?? ''}
                            </div>
                          ))}
                        </div>
                        <span className="text-blue-300 text-sm">-</span>
                        <div className="flex gap-1">
                          {[3, 4, 5].map((i) => (
                            <div key={i} className="flex h-10 w-9 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-base font-bold text-blue-700">
                              {phonePrefix[i] ?? ''}
                            </div>
                          ))}
                        </div>
                        <span className="text-blue-300 text-sm">-</span>
                        {/* 4 หลักสุดท้าย — ผู้ใช้กรอกเอง */}
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={`flex h-10 w-9 items-center justify-center rounded-md border-2 text-base font-bold transition-all ${
                              phoneDigits[i]
                                ? 'bg-gradient-to-b from-blue-100 to-blue-50 border-blue-400 text-blue-900'
                                : 'bg-white border-dashed border-blue-300 text-blue-300'
                            }`}>
                              {phoneDigits[i] ?? '?'}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* On-screen keypad */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-[300px] mx-auto">
                    {[1,2,3,4,5,6,7,8,9].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          if (phoneDigits.length < 4) {
                            setPhoneDigits((p) => p + String(n));
                            setSubmitError(null);
                          }
                        }}
                        className="w-20 h-12 rounded-2xl bg-white shadow-md text-xl font-semibold hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setPhoneDigits((p) => p.slice(0, -1));
                        setSubmitError(null);
                      }}
                      className="w-20 h-12 rounded-2xl bg-white shadow-md text-xl font-bold text-blue-600 hover:bg-blue-100 transition-all border border-gray-100"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        if (phoneDigits.length < 4) {
                          setPhoneDigits((p) => p + "0");
                          setSubmitError(null);
                        }
                      }}
                      className="w-20 h-12 rounded-2xl bg-white shadow-md text-xl font-semibold hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                    >
                      0
                    </button>
                    <button
                      onClick={() => {
                        setPhoneDigits("");
                        setSubmitError(null);
                      }}
                      className="w-20 h-12 rounded-2xl bg-white shadow-md text-xl font-semibold hover:bg-red-100 text-red-500 transition-all border border-gray-100"
                    >
                      C
                    </button>
                  </div>

                    <div
                      className={`
                        overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${phoneDigits.length > 0 ? "max-h-16 opacity-100 mt-4" : "max-h-0 opacity-0"}
                      `}
                    >
                      {phoneDigits.length > 0 && phoneDigits.length < 4 && (
                        <p className="text-base text-orange-500 text-center font-semibold">
                          กรุณากรอกเพิ่มอีก {4 - phoneDigits.length} หลัก
                        </p>
                      )}

                      {phoneDigits.length === 4 && !isPhoneValid && (
                        <p className="text-base text-red-500 text-center font-semibold">
                          หมายเลข 4 หลักสุดท้ายไม่ตรงกับข้อมูลในระบบ
                        </p>
                      )}

                      {phoneDigits.length === 4 && isPhoneValid && (
                        <p className="text-base text-green-600 text-center font-semibold">
                          ยืนยันเบอร์โทรศัพท์สำเร็จ
                        </p>
                      )}
                    </div>
                </div>
              </div>
            )}

            {/* Step 3: Select Courier */}
            {currentStep === 3 && (
              <div className="space-y-2">
                <p className="text-blue-400 text-base mb-3">กรุณาเลือกบริษัทขนส่งที่นำส่งพัสดุ</p>
                <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-100/80 via-sky-50/60 to-amber-100/70 p-5 shadow-lg">
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                  {deliveryCompanies.map((courier) => {
                    const isSelected = selectedCourier?.id === courier.id;
                    return (
                      <div
                        key={courier.id}
                        onClick={() => setSelectedCourier(courier)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all cursor-pointer border-2 relative ${
                          isSelected
                            ? 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-500 text-white shadow-lg shadow-blue-400/25'
                            : 'border-blue-100 bg-white text-blue-900 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white text-lg shadow-sm"
                          style={{ backgroundColor: courier.color || '#D3D3D3' }}
                        >
                          🚚
                        </div>
                        <span className={`text-sm font-bold leading-tight ${
                          isSelected ? 'text-white' : 'text-blue-900'
                        }`}>
                          {courier.name}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Other option */}
                  {(() => {
                    const isSelected = selectedCourier?.id === 'other';
                    return (
                      <div
                        onClick={() => setSelectedCourier({ id: 'other', name: 'อื่นๆ', color: '#9CA3AF' } as DeliveryCompany)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all cursor-pointer border-2 relative ${
                          isSelected
                            ? 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-500 text-white shadow-lg shadow-blue-400/25'
                            : 'border-blue-100 bg-white text-blue-900 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white text-lg shadow-sm"
                          style={{ backgroundColor: '#9CA3AF' }}
                        >
                          🚚
                        </div>
                        <span className={`text-sm font-bold leading-tight ${
                          isSelected ? 'text-white' : 'text-blue-900'
                        }`}>
                          อื่นๆ
                        </span>
                      </div>
                    );
                  })()}
                </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation (Redesign - Match Example, No Duplicate Header, Equal Card Size) */}
            {currentStep === 4 && selectedRoom && selectedCourier && (
              <div className="space-y-2">
                <p className="text-blue-400 text-base mb-3">กรุณาตรวจสอบข้อมูลก่อนกดยืนยันการส่งพัสดุ</p>
                <div className="rounded-xl border border-blue-100 shadow-lg bg-gradient-to-br from-blue-100/80 via-sky-50/60 to-amber-100/70 px-2 py-4 md:px-6 md:py-6">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
                    {/* Room Card */}
                    <div className="flex-1 flex items-center justify-center min-w-[260px] max-w-[320px]">
                      <div className="flex flex-col bg-white rounded-xl p-5 border border-blue-100 shadow-md w-full h-full transition-all duration-200 hover:shadow-lg items-center">
                        {/* Icon (center) */}
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 mb-3">
                          <Home className="w-9 h-9 text-blue-500" />
                        </div>
                        {/* Title + Room Number (center, same line) */}
                        <div className="text-xl font-bold text-blue-500 text-center mb-1">หมายเลขห้อง {selectedRoom.roomNumber}</div>
                        {/* Recipient Name (center) */}
                        <div className="text-gray-500 font-medium text-center">{selectedRoom.name}</div>
                      </div>
                    </div>
                    {/* Phone Card */}
                    <div className="flex-1 flex items-center justify-center min-w-[260px] max-w-[320px]">
                      <div className="flex flex-col bg-white rounded-xl p-5 border border-blue-100 shadow-md w-full h-full transition-all duration-200 hover:shadow-lg items-center">
                        {/* Icon (center) */}
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 mb-3">
                          <Phone className="w-9 h-9 text-blue-500" />
                        </div>
                        {/* Title (center) */}
                        <div className="text-xl font-bold text-blue-500 text-center mb-1">เบอร์โทรศัพท์</div>
                        {/* Phone Number (center) */}
                        <div className="text-gray-500 font-medium text-center">{formatPhoneNumber(fullPhoneNumber)}</div>
                      </div>
                    </div>
                    {/* Courier Card */}
                    <div className="flex-1 flex items-center justify-center min-w-[260px] max-w-[320px]">
                      <div className="flex flex-col bg-white rounded-xl p-5 border border-blue-100 shadow-md w-full h-full transition-all duration-200 hover:shadow-lg items-center">
                        {/* Icon (center) */}
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 mb-3">
                          <Truck className="w-9 h-9 text-blue-500" />
                        </div>
                        {/* Title (center) */}
                        <div className="text-xl font-bold text-blue-500 text-center mb-1">บริษัทขนส่ง</div>
                        {/* Courier Name (center) */}
                        <div className="text-gray-500 font-medium text-center">{selectedCourier.name}</div>
                      </div>
                    </div>
                  </div>
                  {/* Confirmation bar */}
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mt-4">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-semibold text-base">ข้อมูลครบถ้วน พร้อมยืนยันการส่งพัสดุ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-5 flex justify-between">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? () => navigate('/user-home') : goToPrevStep}
                className="gap-2 bg-white/90 border-blue-200 text-blue-700 shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 rounded-xl px-5 py-2.5"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? "กลับหน้าหลัก" : "ย้อนกลับ"}
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => {
                    if (currentStep === 2) {
                      handlePhoneValidation();
                    } else {
                      goToNextStep();
                    }
                  }}
                  disabled={
                    (currentStep === 1 && !selectedRoom) ||
                    (currentStep === 2 && (phoneDigits.length !== 4 || remainingSeconds > 0)) ||
                    (currentStep === 3 && !selectedCourier)
                  }
                  className={`
                    gap-2 
                    bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 
                    hover:from-orange-500 hover:to-yellow-500 
                    text-white shadow-lg shadow-orange-300/30 
                    transition-all duration-200 rounded-xl px-6 py-2.5 font-semibold
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  `}
                >
                  ถัดไป
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-400/30 px-7 py-3 rounded-xl font-bold transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    "ยืนยันการส่งพัสดุ"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showLockPopup && remainingSeconds > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">กรอกเบอร์ผิดเกินกำหนด</h2>
            <p className="text-gray-600">
              กรุณารออีก {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:
              {String(remainingSeconds % 60).padStart(2, '0')} ก่อนลองใหม่อีกครั้ง
            </p>
          </div>
        </div>
      )}

      {/* Processing Popup */}
      {showProcessingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 max-w-md w-full flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              กำลังดำเนินการส่งพัสดุ...
            </h2>
            <p className="text-gray-500 text-center">
              กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูล
            </p>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {isComplete && createdParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 rounded-2xl shadow-xl px-10 py-8 max-w-md w-full flex flex-col items-center">
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <Check className="w-20 h-20 text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              ส่งพัสดุสำเร็จ!
            </h2>

            <p className="text-lg text-gray-400 mb-4 text-center">
              ระบบได้แจ้งเตือนไปยังผู้รับพัสดุเรียบร้อยแล้ว
            </p>

            {/* Tracking Number */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 w-full">
              <p className="text-blue-600 text-center">หมายเลขติดตาม</p>
              <p className="text-xl font-bold text-blue-900 text-center tracking-wider">
                {createdParcel.trackingNumber}
              </p>
            </div>

            <hr className="mb-5 border-t border-gray-300 w-full" />

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  handleFullReset();
                  navigate('/user-home');
                }}
                className="flex-1 border-blue-400 text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-500 font-semibold shadow-none"
              >
                กลับหน้าหลัก
              </Button>

              <Button
                onClick={handleFullReset}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold shadow-md"
              >
                ส่งพัสดุชิ้นถัดไป
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}