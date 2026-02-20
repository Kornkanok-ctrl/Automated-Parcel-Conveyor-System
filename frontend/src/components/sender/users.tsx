"use client";

import { useState } from "react";
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

  // API hooks
  const { recipients, recipientsByFloor, loading: recipientsLoading, error: recipientsError } = useRecipients();
  const { deliveryCompanies, loading: companiesLoading, error: companiesError } = useDeliveryCompanies();

  // เพิ่ม gradient background และ floating accent
  const bgClass = "min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden";
  const accentCircles = (
    <>
      <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-100/30 rounded-full blur-3xl -z-10 translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#1E3A8A]/10 rounded-full blur-2xl -z-10 -translate-x-1/2 -translate-y-1/2" />
    </>
  );

  const steps = [
    { number: 1, title: "เลือกเลขห้อง", icon: Home },
    { number: 2, title: "กรอกเบอร์โทรศัพท์", icon: Phone },
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

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create parcel via API
      const parcelData = {
        roomNumber: selectedRoom.roomNumber,
        recipientName: selectedRoom.name,
        phoneNumber: phoneDigits || selectedRoom.phone,
        deliveryCompany: selectedCourier.name,
        senderPhone: phoneDigits,
      };

      const response = await apiService.createParcel(parcelData);
      
      if (response.success) {
        setCreatedParcel(response.parcel);
        setIsComplete(true);
      } else {
        setSubmitError(response.message || 'เกิดข้อผิดพลาดในการส่งพัสดุ');
      }
    } catch (error) {
      console.error("Submit parcel error:", error);
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งพัสดุ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedRoom(null);
    setSelectedCourier(null);
    setPhoneDigits("");
    setIsComplete(false);
    setSubmitError(null);
    setCreatedParcel(null);
  };

  const formatPhoneNumber = (phone: string) => {
    const only = phone.replace(/\D/g, "");
    if (only.length <= 3) return only;
    if (only.length <= 6) return `${only.slice(0,3)}-${only.slice(3)}`;
    return `${only.slice(0,3)}-${only.slice(3,6)}-${only.slice(6,10)}`.slice(0, 13);
  };

  const displayPhone = phoneDigits || selectedRoom?.phone || "";

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

  if (isComplete && createdParcel) {
    return (
      <div className={bgClass}>
        {accentCircles}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white/90 rounded-2xl shadow-xl px-10 py-12 max-w-md w-full flex flex-col items-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-orange-400 flex items-center justify-center shadow-lg">
                <Check className="w-20 h-20 text-white" strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">ส่งพัสดุสำเร็จ!</h2>
            <p className="text-lg text-gray-400 mb-2">ระบบได้แจ้งเตือนไปยังผู้รับพัสดุเรียบร้อยแล้ว</p>
            
            {/* Tracking Number */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-blue-600 text-center">หมายเลขติดตาม</p>
              <p className="text-xl font-bold text-blue-900 text-center tracking-wider">
                {createdParcel.trackingNumber}
              </p>
            </div>
            
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={() => navigate('/user-home')} className="flex-1 bg-white border-blue-300 text-blue-700 shadow">
                กลับหน้าหลัก
              </Button>
              <Button onClick={handleReset} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow">
                ส่งพัสดุชิ้นถัดไป
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={bgClass}>
      {accentCircles}
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">ส่งพัสดุ</h1>
              <p className="text-xs text-blue-400">ระบบสายพานส่งพัสดุอัตโนมัติ</p>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors shadow-lg ${
                  currentStep > step.number
                    ? "bg-gradient-to-br from-orange-400 to-yellow-400 text-white"
                    : currentStep === step.number
                      ? "bg-gradient-to-br from-blue-600 to-blue-400 text-white"
                      : "bg-blue-100 text-blue-400"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="text-lg">{step.number}</span>
                )}
              </div>
              <span
                className={`ml-2 hidden text-sm font-medium md:block ${
                  currentStep >= step.number
                    ? "text-blue-900"
                    : "text-blue-400"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-1 w-8 rounded-full md:w-16 ${
                    currentStep > step.number ? "bg-gradient-to-r from-blue-600 to-blue-400" : "bg-blue-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <Card className="shadow-xl border-0 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-sm text-white shadow">
                {currentStep}
              </span>
              <span className="text-blue-900">{steps[currentStep - 1]?.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{submitError}</p>
              </div>
            )}

            {/* Step 1: Select Room */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-blue-400">กรุณาเลือกเลขห้องผู้รับพัสดุ</p>
                <div className="rounded-lg border border-blue-200 bg-gradient-to-b from-white to-blue-50 p-6 shadow">
                  {Object.keys(recipientsByFloor).map((floor) => (
                    <div key={floor} className={floor !== '1' ? 'mt-6' : ''}>
                      <h4 className="mb-3 text-sm font-medium text-blue-400">ชั้น {floor}</h4>
                      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                        {recipientsByFloor[floor]?.map((room) => {
                          const isSelected = selectedRoom?.id === room.id;
                          return (
                            <button
                              key={room.id}
                              onClick={() => setSelectedRoom(room)}
                              className={`rounded-lg border-2 p-4 text-center transition-all shadow hover:border-blue-600 ${
                                isSelected ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-blue-400 text-white scale-105' : 'border-blue-200 bg-white text-blue-900'
                              }`}
                            >
                              <div className="text-xl font-bold">{room.roomNumber}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Phone Input */}
            {currentStep === 2 && selectedRoom && (
              <div className="space-y-6">
                <p className="text-blue-400">กรุณาระบุหมายเลขโทรศัพท์มือถือของผู้รับ (10 หลัก)</p>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-blue-400">เลขห้อง</p>
                    <p className="text-4xl font-extrabold text-blue-900">{selectedRoom.roomNumber}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-blue-400 text-center">เบอร์โทรผู้รับ</p>
                    <div className="mt-3 flex justify-center">
                      <div className="inline-flex items-center gap-3 rounded-lg p-3 bg-white shadow">
                        <span className="text-blue-400 self-center">+66</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="flex h-12 w-10 items-center justify-center rounded-md border bg-blue-50 text-lg font-medium shadow">
                                {phoneDigits[i] ?? ""}
                              </div>
                            ))}
                          </div>
                          <div className="w-2" />
                          <div className="flex gap-1">
                            {[3, 4, 5].map((i) => (
                              <div key={i} className="flex h-12 w-10 items-center justify-center rounded-md border bg-blue-50 text-lg font-medium shadow">
                                {phoneDigits[i] ?? ""}
                              </div>
                            ))}
                          </div>
                          <div className="w-2" />
                          <div className="flex gap-1">
                            {[6, 7, 8, 9].map((i) => (
                              <div key={i} className="flex h-12 w-10 items-center justify-center rounded-md border bg-blue-50 text-lg font-medium shadow">
                                {phoneDigits[i] ?? ""}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* On-screen keypad */}
                  <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mt-4">
                    {[1,2,3,4,5,6,7,8,9].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          if (phoneDigits.length < 10) setPhoneDigits((p) => p + String(n));
                        }}
                        className="py-3 rounded-lg bg-white shadow text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPhoneDigits((p) => p.slice(0, -1))}
                      className="py-3 rounded-lg bg-white shadow text-lg font-semibold hover:bg-blue-100"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        if (phoneDigits.length < 10) setPhoneDigits((p) => p + "0");
                      }}
                      className="py-3 rounded-lg bg-white shadow text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      0
                    </button>
                    <button
                      onClick={() => setPhoneDigits("")}
                      className="py-3 rounded-lg bg-white shadow text-lg font-semibold hover:bg-blue-100"
                    >
                      C
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-red-600">
                    {phoneDigits.length > 0 && phoneDigits.length < 10 ? `กรุณากรอกเพิ่มอีก ${10 - phoneDigits.length} หลัก` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Select Courier */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-blue-400">กรุณาเลือกบริษัทขนส่งที่นำส่งพัสดุ</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {deliveryCompanies.map((courier) => (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourier(courier)}
                      className={`flex items-center gap-4 rounded-lg p-4 transition-all cursor-pointer border-2 shadow ${
                        selectedCourier?.id === courier.id
                          ? 'border-blue-600 ring-2 ring-offset-2 ring-blue-400 bg-gradient-to-br from-blue-600 to-blue-400 text-white scale-105'
                          : 'border-blue-200 bg-white text-blue-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="courier"
                        checked={selectedCourier?.id === courier.id}
                        onChange={() => setSelectedCourier(courier)}
                        className="h-5 w-5 accent-blue-600"
                      />
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-lg text-white text-3xl font-bold shadow"
                        style={{ backgroundColor: courier.color || '#D3D3D3' }}
                      >
                        🚚
                      </div>
                      <div className="flex-1">
                        <Label className={`block text-base font-semibold cursor-pointer ${
                          selectedCourier?.id === courier.id ? 'text-white' : 'text-blue-900'
                        }`}>
                          {courier.name}
                        </Label>
                      </div>
                    </div>
                  ))}
                  
                  {/* Other option */}
                  <div
                    onClick={() => setSelectedCourier({ id: 'other', name: 'อื่นๆ', color: '#9CA3AF' } as DeliveryCompany)}
                    className={`flex items-center gap-4 rounded-lg p-4 transition-all cursor-pointer border-2 shadow ${
                      selectedCourier?.id === 'other'
                        ? 'border-blue-600 ring-2 ring-offset-2 ring-blue-400 bg-gradient-to-br from-blue-600 to-blue-400 text-white scale-105'
                        : 'border-blue-200 bg-white text-blue-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="courier"
                      checked={selectedCourier?.id === 'other'}
                      onChange={() => setSelectedCourier({ id: 'other', name: 'อื่นๆ', color: '#9CA3AF' } as DeliveryCompany)}
                      className="h-5 w-5 accent-blue-600"
                    />
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-lg text-white text-3xl font-bold shadow"
                      style={{ backgroundColor: '#9CA3AF' }}
                    >
                      🚚
                    </div>
                    <Label className={`block text-base font-semibold cursor-pointer ${
                      selectedCourier?.id === 'other' ? 'text-white' : 'text-blue-900'
                    }`}>
                      อื่นๆ
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && selectedRoom && selectedCourier && (
              <div className="space-y-6">
                <p className="text-blue-400">กรุณาตรวจสอบข้อมูลก่อนกดยืนยันการส่งพัสดุ</p>
                <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-lg flex flex-col gap-5">
                  {/* Room Card */}
                  <div className="flex items-center gap-5 bg-blue-50 rounded-2xl p-5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg text-blue-900 font-semibold">หมายเลขห้อง</div>
                      <div className="text-3xl font-extrabold text-blue-900 mt-1">{selectedRoom.roomNumber}</div>
                      <div className="text-sm text-blue-600 mt-1">{selectedRoom.name}</div>
                    </div>
                  </div>
                  
                  {/* Phone Card */}
                  <div className="flex items-center gap-5 bg-blue-50 rounded-2xl p-5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg text-blue-900 font-semibold">เบอร์โทรศัพท์</div>
                      <div className="text-3xl font-extrabold text-blue-900 mt-1 tracking-widest">
                        {formatPhoneNumber(displayPhone)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Courier Card */}
                  <div className="flex items-center gap-5 bg-orange-50 rounded-2xl p-5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg text-orange-900 font-semibold">บริษัทขนส่ง</div>
                      <div className="text-2xl font-extrabold text-orange-900 mt-1">{selectedCourier.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? () => navigate('/user-home') : goToPrevStep}
                className="gap-2 bg-white border-blue-300 text-blue-700 shadow"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? "กลับหน้าหลัก" : "ย้อนกลับ"}
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={goToNextStep}
                  disabled={
                    (currentStep === 1 && !selectedRoom) ||
                    (currentStep === 2 && phoneDigits.length < 10) ||
                    (currentStep === 3 && !selectedCourier)
                  }
                  className="gap-2 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white shadow"
                >
                  ถัดไป
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow px-6 py-3 rounded-lg font-bold"
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
    </div>
  );
}
