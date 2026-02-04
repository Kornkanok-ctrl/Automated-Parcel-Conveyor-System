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
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getParcels,
  searchParcels,
  getPendingParcelsCount,
} from "@/lib/parcel-store";
import type { Parcel } from "@/lib/types";
import { useMemo } from "react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  useEffect(() => {
    loadData();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);


  // Custom search: filter all columns in the table
  function filterParcelsAllFields(parcels: Parcel[], query: string): Parcel[] {
    if (!query.trim()) return parcels;
    const lower = query.toLowerCase();
    return parcels.filter((p) => {
      // Check all fields: id, roomNumber, recipientName, phoneNumber, deliveryCompany, createdAt, status
      return (
        p.id.toLowerCase().includes(lower) ||
        p.roomNumber.toLowerCase().includes(lower) ||
        p.recipientName.toLowerCase().includes(lower) ||
        p.phoneNumber.includes(lower) ||
        p.deliveryCompany.toLowerCase().includes(lower) ||
        (p.createdAt && new Date(p.createdAt).toLocaleString('th-TH').includes(lower)) ||
        p.status.toLowerCase().includes(lower)
      );
    });
  }

  useEffect(() => {
    const all = getParcels();
    setParcels(filterParcelsAllFields(all, searchQuery));
  }, [searchQuery]);

  const loadData = () => {
    const all = getParcels();
    setParcels(filterParcelsAllFields(all, searchQuery));
    setPendingCount(getPendingParcelsCount());
  };


  // สถานะใหม่
  type ParcelStatus = "waiting" | "success" | "failed";
  const statusMap: Record<ParcelStatus, { label: string; color: string; icon: React.ReactElement }> = {
    waiting: { label: "รอรับสินค้า", color: "bg-orange-100 text-orange-700", icon: <Clock className="h-3 w-3" /> },
    success: { label: "จัดส่งสินค้าสำเร็จ", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
    failed: { label: "จัดส่งสินค้าไม่สำเร็จ", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="h-3 w-3" /> },
  };

  // ฟังก์ชันแปลงสถานะจาก Parcel (pending, notified, delivered) -> ParcelStatus
  function mapParcelStatus(status: Parcel["status"]): ParcelStatus {
    if (status === "pending") return "waiting";
    if (status === "notified") return "success";
    if (status === "delivered") return "failed";
    return "waiting";
  }

  // สร้าง mock data พร้อม id และ status ใหม่
  const getRandomId = () => Math.floor(100000 + Math.random() * 900000);
  const tableData = useMemo(() =>
    parcels.map((p) => ({
      ...p,
      id: p.id || getRandomId(),
      status: mapParcelStatus(p.status),
      timestamp: p.createdAt ? new Date(p.createdAt) : new Date(),
    })),
    [parcels]
  );

  // สถิติเปอร์เซ็นต์แต่ละสถานะ
  const stats = useMemo(() => {
    const total = tableData.length || 1;
    const waiting = tableData.filter((p) => p.status === "waiting").length;
    const success = tableData.filter((p) => p.status === "success").length;
    const failed = tableData.filter((p) => p.status === "failed").length;
    return {
      waiting: Math.round((waiting / total) * 100),
      success: Math.round((success / total) * 100),
      failed: Math.round((failed / total) * 100),
    };
  }, [tableData]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

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
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-white border-blue-300 text-blue-700 shadow">
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
          <Card className="bg-blue-100 border-0 shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                พัสดุทั้งหมด
              </CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {tableData.length}
              </div>
              <p className="text-xs text-blue-400">รายการ</p>
            </CardContent>
          </Card>
          {/* รอรับสินค้า */}
          <Card className="bg-orange-100 border-0 shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                รอรับสินค้า
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {tableData.filter((p) => p.status === "waiting").length}
              </div>
              <p className="text-xs text-orange-400">รายการ</p>
            </CardContent>
          </Card>

          {/* จัดส่งสินค้าสำเร็จ */}
          <Card className="bg-green-100 border-0 shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                จัดส่งสินค้าสำเร็จ
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {tableData.filter((p) => p.status === "success").length}
              </div>
              <p className="text-xs text-green-500">รายการ</p>
            </CardContent>
          </Card>

          {/* จัดส่งสินค้าไม่สำเร็จ */}
          <Card className="bg-red-100 border-0 shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-900">
                จัดส่งสินค้าไม่สำเร็จ
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {tableData.filter((p) => p.status === "failed").length}
              </div>
              <p className="text-xs text-red-500">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <div className="flex flex-col md:flex-row gap-8">
          <Card className="flex-1 bg-white/90 border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-blue-900">รายการพัสดุ</CardTitle>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                  <Input
                    placeholder="ค้นหา..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-blue-100 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-900">ID</TableHead>
                      <TableHead className="text-blue-900">บริษัทขนส่ง</TableHead>
                      <TableHead className="text-blue-900">Timestamp</TableHead>
                      <TableHead className="text-blue-900">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-8 text-center text-blue-300"
                        >
                          {searchQuery
                            ? "ไม่พบข้อมูลที่ค้นหา"
                            : "ไม่มีข้อมูลพัสดุ"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      tableData.map((parcel) => (
                        <TableRow key={parcel.id}>
                          <TableCell className="font-mono text-blue-900">{parcel.id}</TableCell>
                          <TableCell className="text-orange-900">{parcel.deliveryCompany}</TableCell>
                          <TableCell className="text-blue-400">{formatDate(parcel.timestamp)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusMap[parcel.status]?.color || ''}`}>
                              {statusMap[parcel.status]?.icon}
                              {statusMap[parcel.status]?.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          {/* วงกลมแสดงเปอร์เซ็นต์สถานะ */}
          <div className="w-full md:w-80 flex flex-col items-center justify-center gap-8">
            <div className="w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="50" fill="#fff" />
                {/* waiting */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="12"
                  strokeDasharray={`${(stats.waiting / 100) * 314},314`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* success */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${(stats.success / 100) * 314},314`}
                  strokeDashoffset={`${-((stats.waiting / 100) * 314)}`}
                  strokeLinecap="round"
                />
                {/* failed */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${(stats.failed / 100) * 314},314`}
                  strokeDashoffset={`${-(((stats.waiting + stats.success) / 100) * 314)}`}
                  strokeLinecap="round"
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="2.2em" fill="#1e3a8a" fontWeight="bold">
                  {stats.success}%
                </text>
              </svg>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-orange-400" />
                <span className="text-blue-900 text-sm font-semibold">รอรับสินค้า</span>
                <span className="ml-auto text-blue-400 font-bold">{stats.waiting}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-green-500" />
                <span className="text-blue-900 text-sm font-semibold">จัดส่งสินค้าสำเร็จ</span>
                <span className="ml-auto text-blue-400 font-bold">{stats.success}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-red-500" />
                <span className="text-blue-900 text-sm font-semibold">จัดส่งสินค้าไม่สำเร็จ</span>
                <span className="ml-auto text-blue-400 font-bold">{stats.failed}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
