"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  LogOut,
  Package,
  Search,
  Clock,
  CheckCircle,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiService, type Parcel, type AdminStats } from "../../services/api";
import { useMemo } from "react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    try {
      await apiService.adminLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Force logout even if API call fails
      onLogout();
      navigate("/login");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (parcelId: string, newStatus: string) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [parcelId]: true }));
      
      const response = await apiService.updateParcelStatus(parcelId, newStatus);
      
      if (response.success) {
        // Update the local state
        setParcels(prevParcels => 
          prevParcels.map(parcel => 
            parcel.id === parcelId 
              ? { ...parcel, status: newStatus as Parcel["status"] }
              : parcel
          )
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัพเดตสถานะ');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [parcelId]: false }));
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if admin is logged in first
      if (!apiService.isAdminLoggedIn()) {
        console.log("Admin not logged in, redirecting...");
        onLogout();
        navigate("/login");
        return;
      }

      // Load parcels only
      const parcelsResponse = await apiService.getParcels({ search: searchQuery });

      if (parcelsResponse.success) {
        setParcels(parcelsResponse.parcels);
      }
    } catch (err) {
      console.error("Load data error:", err);
      
      // Handle unauthorized error - redirect to login
      if (err instanceof Error && err.message.includes('401')) {
        console.log("Unauthorized access, redirecting to login...");
        onLogout();
        navigate("/login");
        return;
      }
      
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    console.log('Dashboard mounted, checking authentication...');
    console.log('Admin token:', apiService.getAdminToken());
    console.log('Is admin logged in:', apiService.isAdminLoggedIn());
    
    if (!apiService.isAdminLoggedIn()) {
      console.log('Not authenticated, redirecting to login...');
      onLogout();
      navigate("/login");
      return;
    }
    
    console.log('Authentication OK, loading data...');
    loadData();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (!apiService.isAdminLoggedIn()) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // สถานะใหม่ - แก้ไข mapping ให้ถูกต้อง
  type ParcelStatus = "waiting" | "success" | "failed";
  const statusMap: Record<ParcelStatus, { label: string; color: string; icon: React.ReactElement }> = {
    waiting: { label: "รอรับสินค้า", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Clock className="h-3 w-3" /> },
    success: { label: "รับสินค้าแล้ว", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
    failed: { label: "ส่งคืนแล้ว", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" /> },
  };

  // ฟังก์ชันแปลงสถานะ - แก้ไขให้ถูกต้อง
  function mapParcelStatus(status: Parcel["status"]): ParcelStatus {
    if (status === "pending") return "waiting";   // ยังไม่ได้ส่ง -> รอรับสินค้า
    if (status === "notified") return "waiting";  // ส่งแล้วแต่ยังไม่ได้รับ -> รอรับสินค้า  
    if (status === "collected") return "success"; // รับแล้ว -> รับสินค้าแล้ว
    if (status === "returned") return "failed";   // ส่งคืนแล้ว -> ส่งคืนแล้ว
    return "waiting";
  }

  // สร้างข้อมูลตารางจากข้อมูล API
  const tableData = useMemo(() =>
    parcels.map((p) => ({
      ...p,
      displayStatus: mapParcelStatus(p.status),
      timestamp: p.createdAt ? new Date(p.createdAt) : new Date(),
    })),
    [parcels]
  );

  // คำนวณสถิติจากข้อมูลพัสดุจริง
  const stats = useMemo(() => {
    const total = parcels.length;
    const waitingCount = parcels.filter(p => 
      p.status === 'pending' || p.status === 'notified'
    ).length;
    const successCount = parcels.filter(p => p.status === 'collected').length;
    const failedCount = parcels.filter(p => p.status === 'returned').length;

    return {
      total,
      waiting: waitingCount,
      success: successCount,
      failed: failedCount,
      percentages: {
        waiting: total > 0 ? Math.round((waitingCount / total) * 100) : 0,
        success: total > 0 ? Math.round((successCount / total) * 100) : 0,
        failed: total > 0 ? Math.round((failedCount / total) * 100) : 0,
      }
    };
  }, [parcels]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Render status buttons
  const renderStatusButtons = (parcel: any) => {
    const isUpdating = updatingStatus[parcel.id];
    const canCollect = parcel.status === 'pending' || parcel.status === 'notified';
    const canReturn = parcel.status === 'collected' || parcel.status === 'pending' || parcel.status === 'notified';
    
    if (parcel.status === 'collected') {
      return (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate(parcel.id, 'returned')}
            disabled={isUpdating}
            className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            title="ส่งคืน"
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          </Button>
        </div>
      );
    }
    
    if (parcel.status === 'returned') {
      return (
        <div className="flex gap-1">
          <span className="text-xs text-gray-500">ส่งคืนแล้ว</span>
        </div>
      );
    }
    
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(parcel.id, 'collected')}
          disabled={isUpdating || !canCollect}
          className="h-7 w-7 p-0 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400"
          title="รับสินค้า"
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(parcel.id, 'returned')}
          disabled={isUpdating || !canReturn}
          className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          title="ส่งคืน"
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden flex items-center justify-center">
        <div className="bg-white/90 rounded-2xl shadow-xl px-10 py-12 max-w-md w-full flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">กำลังโหลดข้อมูล...</h2>
          <p className="text-gray-500 text-center">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden flex items-center justify-center">
        <div className="bg-white/90 rounded-2xl shadow-xl px-10 py-12 max-w-md w-full flex flex-col items-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-500 text-center mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" className="bg-white">
              โหลดใหม่
            </Button>
            <Button onClick={handleLogout} className="bg-blue-600 text-white">
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">
                Admin Dashboard
              </h1>
              <p className="text-xs text-blue-400">
                ระบบจัดการพัสดุ
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-white border-blue-300 text-blue-700 shadow hover:bg-blue-50">
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Accent Circles */}
        <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-100/30 rounded-full blur-3xl -z-10 translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#1E3A8A]/10 rounded-full blur-2xl -z-10 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {/* พัสดุทั้งหมด */}
          <Card className="bg-blue-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                พัสดุทั้งหมด
              </CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {stats.total}
              </div>
              <p className="text-xs text-blue-400">รายการ</p>
            </CardContent>
          </Card>
          
          {/* รอรับสินค้า */}
          <Card className="bg-orange-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                รอรับสินค้า
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {stats.waiting}
              </div>
              <p className="text-xs text-orange-400">รายการ</p>
            </CardContent>
          </Card>

          {/* รับสินค้าแล้ว */}
          <Card className="bg-green-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                รับสินค้าแล้ว
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {stats.success}
              </div>
              <p className="text-xs text-green-500">รายการ</p>
            </CardContent>
          </Card>

          {/* ส่งคืนแล้ว */}
          <Card className="bg-red-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-900">
                ส่งคืนแล้ว
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {stats.failed}
              </div>
              <p className="text-xs text-red-500">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <div className="flex flex-col lg:flex-row gap-8">
          <Card className="flex-1 bg-white/90 border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-blue-900">รายการพัสดุ ({parcels.length} รายการ)</CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                  <Input
                    placeholder="ค้นหาพัสดุ..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-blue-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-900 font-semibold">Tracking</TableHead>
                        <TableHead className="text-blue-900 font-semibold">ห้อง</TableHead>
                        <TableHead className="text-blue-900 font-semibold">ผู้รับ</TableHead>
                        <TableHead className="text-blue-900 font-semibold">บริษัทขนส่ง</TableHead>
                        <TableHead className="text-blue-900 font-semibold">วันเวลา</TableHead>
                        <TableHead className="text-blue-900 font-semibold">สถานะ</TableHead>
                        <TableHead className="text-blue-900 font-semibold">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-12 text-center text-blue-300"
                          >
                            <Package className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                            <p className="text-lg font-medium">
                              {searchQuery
                                ? "ไม่พบข้อมูลที่ค้นหา"
                                : "ไม่มีข้อมูลพัสดุ"}
                            </p>
                            {searchQuery && (
                              <p className="text-sm mt-2">
                                ลองค้นหาด้วยคำอื่น หรือ{" "}
                                <button
                                  onClick={() => setSearchQuery("")}
                                  className="text-blue-500 hover:underline"
                                >
                                  ล้างการค้นหา
                                </button>
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        tableData.map((parcel) => (
                          <TableRow key={parcel.id} className="hover:bg-blue-50/50 transition-colors">
                            <TableCell className="font-mono text-sm text-blue-900 font-semibold">
                              {parcel.trackingNumber}
                            </TableCell>
                            <TableCell className="text-blue-900 font-medium">{parcel.roomNumber}</TableCell>
                            <TableCell className="text-blue-900">{parcel.recipientName}</TableCell>
                            <TableCell className="text-orange-900 font-medium">{parcel.deliveryCompany}</TableCell>
                            <TableCell className="text-blue-400 text-sm">{formatDate(parcel.timestamp)}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusMap[parcel.displayStatus]?.color || ''}`}>
                                {statusMap[parcel.displayStatus]?.icon}
                                {statusMap[parcel.displayStatus]?.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              {renderStatusButtons(parcel)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* วงกลมแสดงเปอร์เซ็นต์สถานะ */}
          <div className="w-full lg:w-80 flex flex-col items-center justify-center gap-8">
            <Card className="w-full bg-white/90 border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-blue-900">สถิติสถานะพัสดุ</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-56 h-56 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    
                    {/* Waiting circle */}
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="12"
                      strokeDasharray={`${(stats.percentages.waiting / 100) * 314},314`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-in-out"
                    />
                    
                    {/* Success circle */}
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeDasharray={`${(stats.percentages.success / 100) * 314},314`}
                      strokeDashoffset={`${-((stats.percentages.waiting / 100) * 314)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-in-out"
                    />
                    
                    {/* Failed circle */}
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="12"
                      strokeDasharray={`${(stats.percentages.failed / 100) * 314},314`}
                      strokeDashoffset={`${-(((stats.percentages.waiting + stats.percentages.success) / 100) * 314)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-in-out"
                    />
                    
                    {/* Center text */}
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="1.8em" fill="#1e3a8a" fontWeight="bold" className="rotate-90" transform="rotate(90 60 60)">
                      {stats.percentages.success}%
                    </text>
                  </svg>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-orange-400" />
                      <span className="text-orange-900 text-sm font-semibold">รอรับสินค้า</span>
                    </div>
                    <span className="text-orange-700 font-bold">{stats.percentages.waiting}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-green-900 text-sm font-semibold">รับสินค้าแล้ว</span>
                    </div>
                    <span className="text-green-700 font-bold">{stats.percentages.success}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-red-900 text-sm font-semibold">ส่งคืนแล้ว</span>
                    </div>
                    <span className="text-red-700 font-bold">{stats.percentages.failed}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}