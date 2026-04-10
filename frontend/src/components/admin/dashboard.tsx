"use client";

import { useState, useEffect, Fragment } from "react";
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
  Users,
  Edit,
  Trash2,
  Save,
  Phone,
  User,
  Home,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { apiService, type Parcel, type AdminRecipient, type UpdateRecipientRequest, type BulkStatusUpdateRequest, type ParcelStatusHistoryResponse } from "../../services/api";
import { useMemo } from "react";
import PieChart from "./PieChart";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("parcels");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Recipients management states
  const [editForm, setEditForm] = useState<UpdateRecipientRequest>({ fullname: "", phone: "" });
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmCloseEditOpen, setConfirmCloseEditOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<AdminRecipient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [successPopup, setSuccessPopup] = useState<{ show: boolean; message: string; type: 'edit' | 'delete' | 'error' } | null>(null);
  
  // Separate lastUpdated for each tab - อัปเดตเฉพาะเมื่อข้อมูลเปลี่ยนแปลงจริง
  const [parcelLastUpdated, setParcelLastUpdated] = useState<Date | null>(null);
  const [recipientLastUpdated, setRecipientLastUpdated] = useState<Date | null>(null); 

  const [selectedParcels, setSelectedParcels] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedParcelHistory, setSelectedParcelHistory] = useState<ParcelStatusHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Status management states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedParcelForStatus, setSelectedParcelForStatus] = useState<Parcel | null>(null);
  const [updatingParcelStatus, setUpdatingParcelStatus] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string | null>(null);
  const [confirmCloseStatusOpen, setConfirmCloseStatusOpen] = useState(false);


  const companyColors: Record<string, string> = {
    "Flash Express": "bg-amber-100 text-amber-600 border border-amber-200",
    "J&T Express": "bg-red-100 text-red-600 border border-red-200",
    "Kerry Express": "bg-orange-100 text-orange-600 border border-orange-200",
    "Ninja Van": "bg-purple-100 text-purple-600 border border-purple-200",
    "Thailand Post": "bg-blue-100 text-blue-600 border border-blue-200",
    "ไปรษณีย์ไทย": "bg-blue-100 text-blue-600 border border-blue-200",
    "SCG Express": "bg-pink-100 text-pink-600 border border-pink-200",
    "BEST Express": "bg-cyan-100 text-cyan-600 border border-cyan-200",
    "DHL": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "FedEx": "bg-indigo-100 text-indigo-600 border border-indigo-200",
    "UPS": "bg-stone-100 text-stone-700 border border-stone-200",
    "อื่นๆ": "bg-slate-100 text-slate-600 border border-slate-200",
  };

    // pagination - parcels
  const [parcelPage, setParcelPage] = useState(1);
  const PARCELS_PER_PAGE = 5;

  // pagination - recipients
  const [recipientPage, setRecipientPage] = useState(1);
  const RECIPIENTS_PER_PAGE = 5;

  const toggleParcelSelection = (parcelId: string) => {
    const newSelected = new Set(selectedParcels);
    if (newSelected.has(parcelId)) {
      newSelected.delete(parcelId);
    } else {
      newSelected.add(parcelId);
    }
    setSelectedParcels(newSelected);
  };
  const selectAllParcels = () => {
    if (selectedParcels.size === tableData.length) {
      setSelectedParcels(new Set());
    } else {
      setSelectedParcels(new Set(tableData.map(p => p.id.toString())));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedParcels.size === 0) return;
    
    try {
      setBulkUpdating(true);
      
      const request: BulkStatusUpdateRequest = {
        parcelIds: Array.from(selectedParcels),
        status: newStatus
      };
      
      const response = await apiService.bulkUpdateParcelStatus(request);
      
      if (response.success) {
        // อัปเดต parcels state
        setParcels(prevParcels => 
          prevParcels.map(parcel => {
            const updatedParcel = response.parcels.find(p => p.id.toString() === parcel.id.toString());
            return updatedParcel || parcel;
          })
        );
        
        setSelectedParcels(new Set());
        setParcelLastUpdated(new Date());
        
        // แสดงข้อความสำเร็จ
        setSuccessPopup({ 
          show: true, 
          message: `อัปเดตสถานะ ${response.updatedCount} รายการเรียบร้อยแล้ว`, 
          type: 'edit' 
        });
      }
    } catch (err) {
      console.error("Bulk status update error:", err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleViewHistory = async (parcel: Parcel) => {
    try {
      setLoadingHistory(true);
      setHistoryDialogOpen(true);
      
      const response = await apiService.getParcelStatusHistory(parcel.id.toString());
      
      if (response.success) {
        await new Promise(resolve => setTimeout(resolve, 400)); // เพิ่มดีเลย์ 0.4 วินาที เพื่อให้ dialog เปิดก่อนแสดงข้อมูล
        setSelectedParcelHistory(response);
      }
    } catch (err) {
      console.error("Get status history error:", err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงประวัติสถานะ');
    } finally {
      setLoadingHistory(false);
    }
  };

  const renderStatusButtons = (parcel: any) => {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => openStatusDialog(parcel)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
          title="จัดการสถานะ"
        >
          <Edit className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">จัดการ</span>
        </button>

        <button
          onClick={() => handleViewHistory(parcel)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
          title="ดูประวัติสถานะ"
        >
          <Clock className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600">ประวัติ</span>
        </button>
      </div>
    );
  };

  // Clear edit state when changing page
  const handleRecipientPageChange = (page: number) => {
    if (editDialogOpen) {
      handleCancelEdit();
    }
    setRecipientPage(page);
  };

  const handleLogout = async () => {
    try {
      await apiService.adminLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      onLogout();
      navigate("/login");
    }
  };

  const handleStatusUpdate = async (parcelId: string, newStatus: string) => {
    try {
      setUpdatingParcelStatus(true);
      
      const response = await apiService.updateParcelStatus(parcelId, newStatus);
      
      if (response.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setParcels(prevParcels => 
          prevParcels.map(parcel => 
            parcel.id.toString() === parcelId
              ? { ...parcel, status: newStatus as Parcel["status"] }
              : parcel
          )
        );
        setParcelLastUpdated(new Date());
        setStatusDialogOpen(false);
        setSelectedParcelForStatus(null);
        setSelectedNewStatus(null);
        
        setSuccessPopup({ 
          show: true, 
          message: "อัปเดตสถานะเรียบร้อยแล้ว", 
          type: 'edit' 
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      setUpdatingParcelStatus(false);
      const errorMsg = parseApiError(err, 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      setSuccessPopup({ show: true, message: errorMsg, type: 'error' });
    } finally {
      setUpdatingParcelStatus(false);
    }
  };

  const openStatusDialog = (parcel: Parcel) => {
    setSelectedParcelForStatus(parcel);
    setSelectedNewStatus(null);
    setStatusDialogOpen(true);
  };

  const loadParcels = async () => {
    try {
      const parcelsResponse = await apiService.getParcels({ search: searchQuery });
      if (parcelsResponse.success) {
        setParcels(parcelsResponse.parcels);
      }
    } catch (err) {
      console.error("Load parcels error:", err);
      throw err;
    }
  };

  const loadRecipients = async () => {
    try {
      const recipientsResponse = await apiService.getRecipientsForAdmin({ search: recipientSearchQuery });
      if (recipientsResponse.success) {
        setRecipients(recipientsResponse.recipients);
      }
    } catch (err) {
      console.error("Load recipients error:", err);
      throw err;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!apiService.isAdminLoggedIn()) {
        // console.log("Admin not logged in, redirecting...");
        onLogout();
        navigate("/login");
        return;
      }

      await Promise.all([loadParcels(), loadRecipients()]);
      setParcelLastUpdated(new Date());
      setRecipientLastUpdated(new Date());
    } catch (err) {
      console.error("Load data error:", err);
      
      if (err instanceof Error && err.message.includes('401')) {
        // console.log("Unauthorized access, redirecting to login...");
        onLogout();
        navigate("/login");
        return;
      }
      
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Recipients management functions
  const handleEdit = (recipient: AdminRecipient) => {
    setSelectedRecipient(recipient);
    setEditForm({
      fullname: recipient.fullname,
      phone: recipient.phone
    });
    setEditDialogOpen(true);
  };

  // ตรวจสอบว่ามีการเปลี่ยนแปลงข้อมูลจริงหรือไม่
  const hasEditChanged = selectedRecipient 
    ? editForm.fullname !== selectedRecipient.fullname || editForm.phone !== selectedRecipient.phone
    : false;

  const handleTryCloseEdit = () => {
    if (hasEditChanged) {
      setConfirmCloseEditOpen(true);
    } else {
      handleCancelEdit();
    }
  };

  const handleConfirmCloseEdit = () => {
    setConfirmCloseEditOpen(false);
    setEditDialogOpen(false);
    setSelectedRecipient(null);
    setEditForm({ fullname: "", phone: "" });
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setSelectedRecipient(null);
    setEditForm({ fullname: "", phone: "" });
  };

  // Parse API error to extract clean Thai message
  const parseApiError = (err: unknown, fallback: string): string => {
    if (err instanceof Error) {
      // Try to extract JSON message from "HTTP 400: Bad Request - {"success":false,"message":"..."}" format
      const jsonMatch = err.message.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) return parsed.message;
        } catch { /* ignore parse error */ }
      }
      return err.message;
    }
    return fallback;
  };

  const handleSaveEdit = async () => {
    if (!selectedRecipient) return;

    try {
      setUpdating(true);
      const response = await apiService.updateRecipient(selectedRecipient.id, editForm);

      if (response.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEditDialogOpen(false);
        setSelectedRecipient(null);
        setEditForm({ fullname: "", phone: "" });
        setRecipientLastUpdated(new Date());
        setUpdating(false);
        setSuccessPopup({ show: true, message: "แก้ไขข้อมูลสำเร็จแล้ว", type: "edit" });
        setRecipients(prev => 
          prev.map(recipient => 
            recipient.id === response.recipient.id 
              ? response.recipient
              : recipient
          )
        );
      }
    } catch (err) {
      console.error("Update recipient error:", err);
      setUpdating(false);
      const errorMsg = parseApiError(err, 'เกิดข้อผิดพลาดในการอัปเดต');
      setSuccessPopup({ show: true, message: errorMsg, type: 'error' });
    }
  };

  const handleDelete = (recipient: AdminRecipient) => {
    setSelectedRecipient(recipient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecipient) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteRecipient(selectedRecipient.id);

      if (response.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeleteDialogOpen(false);
        setPendingDeleteId(selectedRecipient.id);
        setSelectedRecipient(null);
        setRecipientLastUpdated(new Date());
        setDeleting(false);
        setSuccessPopup({ show: true, message: "ลบข้อมูลสำเร็จแล้ว", type: "delete" });
      }
    } catch (err) {
      console.error("Delete recipient error:", err);
      setDeleting(false);
      const errorMsg = parseApiError(err, 'เกิดข้อผิดพลาดในการลบ');
      setSuccessPopup({ show: true, message: errorMsg, type: 'error' });
    }
  };

  useEffect(() => {
    // console.log('Dashboard mounted, checking authentication...');
    
    if (!apiService.isAdminLoggedIn()) {
      // console.log('Not authenticated, redirecting to login...');
      onLogout();
      navigate("/login");
      return;
    }
    
    loadData();
  }, []);

  // Handle search with debounce for parcels
  useEffect(() => {
    if (!apiService.isAdminLoggedIn()) return;
    
    const timeoutId = setTimeout(() => {
      loadParcels().catch(console.error);
      setParcelPage(1);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search with debounce for recipients
  useEffect(() => {
    if (!apiService.isAdminLoggedIn()) return;
    
    const timeoutId = setTimeout(() => {
      loadRecipients().catch(console.error);
      setRecipientPage(1);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [recipientSearchQuery]);

  // Auto-dismiss success popup
  useEffect(() => {
    if (successPopup?.show) {
      const duration = successPopup.type === 'error' ? 5000 : 3000;
      const timer = setTimeout(() => {
        if (successPopup.type === 'delete' && pendingDeleteId) {
          setRecipients(prev => prev.filter(r => r.id !== pendingDeleteId));
          setPendingDeleteId(null);
        }
        setSuccessPopup(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [successPopup]);

  // Status mapping and calculations
  type ParcelStatus = "waiting" | "success" | "failed";
  const statusMap: Record<ParcelStatus, { label: string; color: string; icon: React.ReactElement }> = {
    waiting: { label: "รอรับพัสดุ", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Clock className="h-3 w-3" /> },
    success: { label: "รับพัสดุแล้ว", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
    failed: { label: "ส่งคืนแล้ว", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" /> },
  };

  // Map backend status to display status
  function mapParcelStatus(status: Parcel["status"]): ParcelStatus {
    if (status === "pending") return "waiting";
    if (status === "notified") return "waiting";
    if (status === "collected") return "success";
    if (status === "returned") return "failed";
    return "waiting";
  }

  // Prepare table data with displayStatus and formatted timestamp
  const tableData = useMemo(() => {
    return parcels.map((p) => ({
      ...p,
      displayStatus: mapParcelStatus(p.status),
      timestamp: p.createdAt ? new Date(p.createdAt) : new Date(),
    }));
  }, [parcels]);

  // Parcels pagination 
  const paginatedParcels = useMemo(() => {
    const start = (parcelPage - 1) * PARCELS_PER_PAGE;
    return tableData.slice(start, start + PARCELS_PER_PAGE);
  }, [tableData, parcelPage]);

  const totalParcelPages = Math.ceil(tableData.length / PARCELS_PER_PAGE);

  // Recipients pagination
  const paginatedRecipients = useMemo(() => {
    const start = (recipientPage - 1) * RECIPIENTS_PER_PAGE;
    return recipients.slice(start, start + RECIPIENTS_PER_PAGE);
  }, [recipients, recipientPage]);

  const totalRecipientPages = Math.ceil(recipients.length / RECIPIENTS_PER_PAGE);

  // Stats calculations
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

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(typeof date === 'string' ? new Date(date) : date);
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
            SmartParcel Dashboard
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative mx-auto w-full px-6 py-8 overflow-hidden">
        {/* Accent Circles */}
        <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-100/30 rounded-full blur-3xl -z-10 translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#1E3A8A]/10 rounded-full blur-2xl -z-10 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Stats Cards */}
        <div className="mb-5 grid gap-4 md:grid-cols-5">
          <Card className="bg-blue-100 border-0 shadow hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                พัสดุทั้งหมด
              </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-400">รายการ</p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-100 border-0 shadow hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                รอรับพัสดุ
              </CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition">
                  <Clock className="h-4 w-4 text-orange-400" />
                </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.waiting}</div>
              <p className="text-xs text-orange-400">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-green-100 border-0 shadow hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                รับพัสดุแล้ว
              </CardTitle>
               <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition">
                 <CheckCircle className="h-4 w-4 text-green-500" />
               </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.success}</div>
              <p className="text-xs text-green-500">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-red-100 border-0 shadow hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-900">
                ส่งคืนแล้ว
              </CardTitle>
               <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition">
                 <AlertTriangle className="h-4 w-4 text-red-500" />
               </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{stats.failed}</div>
              <p className="text-xs text-red-500">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-100 border-0 shadow hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                ผู้รับทั้งหมด
              </CardTitle>
               <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition">
                 <Users className="h-4 w-4 text-purple-500" />
               </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{recipients.length}</div>
              <p className="text-xs text-purple-500">คน</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Parcels and Recipients Management */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSearchQuery("");
          setRecipientSearchQuery("");
          setParcelPage(1);
          setRecipientPage(1);
        }} className="w-full">
          <TabsList className="mx-auto flex w-fit bg-white/10 backdrop-blur-md border border-white/20 shadow-sm mb-4 rounded-xl p-1">
            <TabsTrigger
              value="parcels"
              className="
                rounded-lg
                outline-none focus:outline-none focus:ring-0 focus-visible:ring-0
                hover:bg-white/40
                data-[state=active]:bg-transparent
                data-[state=active]:text-blue-700
                transition-all duration-200
              "
            >
              <Package className="h-4 w-4 mr-2" />
              จัดการพัสดุ

              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {parcels.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="recipients"
              className="
                rounded-lg
                outline-none focus:outline-none focus:ring-0 focus-visible:ring-0
                hover:bg-white/40
                data-[state=active]:bg-transparent
                data-[state=active]:text-blue-700
                transition-all duration-200
              "
            >
              <Users className="h-4 w-4 mr-2" />
              จัดการผู้รับ

              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {recipients.length}
              </span>
            </TabsTrigger>          
          </TabsList>

          {/* Parcels Tab */}
          <TabsContent value="parcels">
            <Card className="bg-white/90 border-0 shadow-xl">
                  <CardHeader className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-3 flex-wrap">
                        {/* LEFT: Title */}
                        <div>
                          <CardTitle className="text-blue-900">
                            รายการพัสดุ ({parcels.length} รายการ)
                          </CardTitle>
                        </div>

                        {/* MIDDLE: Bulk Actions (when selected) */}
                        {selectedParcels.size > 0 && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-3 py-2">
                            <span className="text-sm font-semibold text-blue-700">
                              เลือก {selectedParcels.size} รายการ
                            </span>                       
                            <button
                              onClick={() => handleBulkStatusUpdate('pending')}
                              disabled={bulkUpdating}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-medium shadow-sm border border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                              รอรับพัสดุ
                            </button>

                            <button
                              onClick={() => handleBulkStatusUpdate('collected')}
                              disabled={bulkUpdating}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-900 text-xs font-medium shadow-sm border border-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              รับพัสดุแล้ว
                            </button>

                            <button
                              onClick={() => handleBulkStatusUpdate('returned')}
                              disabled={bulkUpdating}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 text-xs font-medium shadow-sm border border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
                              ส่งคืนแล้ว
                            </button>

                            <button
                              onClick={() => setSelectedParcels(new Set())}
                              className="flex items-center justify-center text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg w-8 h-8 hover:bg-blue-200 transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex-1" />

                        {/* RIGHT: Search */}
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />

                          <Input
                            placeholder="ค้นหารายการพัสดุ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-blue-200 focus:border-blue-400 bg-white rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                  {/* TABLE - ด้านซ้าย (กว้างกว่า) */}
                  <div className="xl:col-span-3">
                    <div className="
                      rounded-xl
                      border border-blue-200
                      overflow-hidden
                      shadow-lg
                      bg-white
                      h-full
                      flex flex-col
                    ">
                      <div className="flex-1 overflow-x-auto">
                        <Table className="border-collapse border-blue-200">
                          <TableHeader className="border-b border-blue-200">
                            <TableRow className="bg-blue-200 border-b border-blue-200">
                              <TableHead className="w-12 text-blue-900 font-semibold">
                                <div
                                  onClick={selectAllParcels}
                                  className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center cursor-pointer transition-all duration-150 ${
                                    selectedParcels.size === tableData.length && tableData.length > 0
                                      ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200'
                                      : selectedParcels.size > 0
                                      ? 'bg-blue-400 border-blue-400 shadow-sm'
                                      : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                                  }`}
                                >
                                  {selectedParcels.size > 0 && (
                                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead className="text-blue-900 font-semibold">เลขพัสดุ</TableHead>
                              <TableHead className="text-blue-900 font-semibold">ห้อง</TableHead>
                              <TableHead className="text-blue-900 font-semibold">ชื่อผู้รับ</TableHead>
                              <TableHead className="text-blue-900 font-semibold">บริษัทขนส่ง</TableHead>
                              <TableHead className="text-blue-900 font-semibold">วันที่สร้าง</TableHead>
                              <TableHead className="text-blue-900 font-semibold">สถานะ</TableHead>
                              <TableHead className="text-blue-900 font-semibold">จัดการ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableData.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="h-[280px]">
                                  <div className="flex flex-col items-center justify-center h-full">
                                    <Package className="h-12 w-12 mb-4 text-blue-300" />
                                    <p className="text-lg font-medium text-blue-400">
                                      {searchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลพัสดุ"}
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              paginatedParcels.map((parcel) => (
                                <TableRow
                                  key={parcel.id}
                                  className={`h-14 border-b border-blue-100 transition-all duration-200 ${
                                    selectedParcels.has(parcel.id.toString())
                                      ? 'bg-blue-100 border-blue-200'
                                      : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 even:bg-slate-50/50'
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <TableCell>
                                    <div
                                      onClick={() => toggleParcelSelection(parcel.id.toString())}
                                      className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center cursor-pointer transition-all duration-150 ${
                                        selectedParcels.has(parcel.id.toString())
                                          ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200 scale-105'
                                          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                                      }`}
                                    >
                                      {selectedParcels.has(parcel.id.toString()) && (
                                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                                      )}
                                    </div>
                                  </TableCell>

                                  {/* Tracking */}
                                  <TableCell className="font-medium text-blue-600">
                                    <span className="bg-blue-100 px-2 py-1 rounded-md">
                                      {parcel.trackingNumber}
                                    </span>
                                  </TableCell>

                                  {/* Room */}
                                  <TableCell className="text-gray-500 font-medium">
                                    {parcel.roomNumber}
                                  </TableCell>

                                  {/* Recipient */}
                                  <TableCell className="text-gray-500 font-medium whitespace-nowrap">
                                    {parcel.recipientName}
                                  </TableCell>

                                  {/* Company */}
                                  <TableCell>
                                    <span
                                      className={`
                                        inline-block px-2.5 py-0.5 rounded-lg text-xs whitespace-nowrap
                                        font-medium
                                        ${companyColors[parcel.deliveryCompany] || companyColors["อื่นๆ"]}
                                      `}
                                    >
                                      {parcel.deliveryCompany}
                                    </span>
                                  </TableCell>

                                  {/* Date */}
                                  <TableCell className="text-gray-500 font-medium whitespace-nowrap text-xs">
                                    {formatDate(parcel.timestamp)}
                                  </TableCell>

                                  {/* Status */}
                                  <TableCell>
                                    <span
                                      className={`
                                        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap
                                        ${statusMap[parcel.displayStatus]?.color}
                                      `}
                                    >
                                      {statusMap[parcel.displayStatus]?.icon}
                                      {statusMap[parcel.displayStatus]?.label}
                                    </span>
                                  </TableCell>

                                  {/* จัดการ */}
                                  <TableCell className="w-40">
                                    {renderStatusButtons(parcel)}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100 bg-gradient-to-r from-blue-50/50 to-white mt-auto">
                        <div className="text-sm text-gray-500 font-medium">
                          แสดง <span className="text-blue-600">{tableData.length > 0 ? ((parcelPage - 1) * PARCELS_PER_PAGE) + 1 : 0}-{Math.min(parcelPage * PARCELS_PER_PAGE, tableData.length)}</span> จาก <span className="text-blue-600">{tableData.length}</span> รายการ
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={parcelPage === 1}
                            onClick={() => setParcelPage(parcelPage - 1)}
                            className="h-8 px-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40"
                          >
                            <span className="text-xs">‹ ก่อนหน้า</span>
                          </Button>
                          
                          <div className="flex items-center gap-1 mx-1">
                            {Array.from({ length: totalParcelPages }, (_, i) => i + 1)
                              .filter(page => {
                                if (totalParcelPages <= 5) return true;
                                if (page === 1 || page === totalParcelPages) return true;
                                if (Math.abs(page - parcelPage) <= 1) return true;
                                return false;
                              })
                              .map((page, idx, arr) => (
                                <Fragment key={page}>
                                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                                    <span className="text-gray-400 px-1">...</span>
                                  )}
                                  <Button
                                    variant={parcelPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setParcelPage(page)}
                                    className={`h-8 w-8 p-0 text-xs font-medium transition-all ${
                                      parcelPage === page 
                                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                                        : "border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                    }`}
                                  >
                                    {page}
                                  </Button>
                                </Fragment>
                              ))
                            }
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={parcelPage === totalParcelPages || totalParcelPages === 0}
                            onClick={() => setParcelPage(parcelPage + 1)}
                            className="h-8 px-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40"
                          >
                            <span className="text-xs">ถัดไป ›</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PIE CHART - ด้านขวา */}
                  <div className="xl:col-span-1">
                    {/* Pie Chart Card */}
                    <div className="rounded-xl border border-blue-200 shadow-lg bg-white p-4 h-full flex flex-col">
                      <h3 className="font-semibold text-blue-900 mb-3 text-center text-sm">
                        สถิติพัสดุ
                      </h3>
                      <div className="flex-1 flex items-center">
                        <PieChart stats={stats} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients">
            <Card className="bg-white/90 border-0 shadow-xl">
              <CardHeader className="pt-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                      {/* LEFT: Title */}
                      <div>
                        <CardTitle className="text-blue-900">
                          จัดการผู้รับ ({recipients.length} คน)
                        </CardTitle>
                      </div>

                      {/* RIGHT: Search */}
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />

                        <Input
                          placeholder="ค้นหาข้อมูลผู้รับ..."
                          value={recipientSearchQuery}
                          onChange={(e) => setRecipientSearchQuery(e.target.value)}
                          className="pl-10 border-blue-200 focus:border-blue-400 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardHeader>
              <CardContent>
                <div className="
                    rounded-xl
                    border border-blue-200
                    overflow-hidden
                    shadow-lg
                    bg-white
                    flex flex-col
                  ">
                  <div className="flex-1 overflow-hidden"> 
                    <Table className="border-collapse border-blue-200">
                      <TableHeader className="border-b border-blue-200">
                        <TableRow className="bg-blue-200 border-b border-blue-200">
                          <TableHead className="text-blue-900 font-semibold">ห้อง</TableHead>
                          <TableHead className="text-blue-900 font-semibold">ชื่อผู้รับ</TableHead>
                          <TableHead className="text-blue-900 font-semibold">เบอร์โทรศัพท์</TableHead>
                          <TableHead className="text-blue-900 font-semibold">วันที่สร้าง</TableHead>
                          <TableHead className="text-blue-900 font-semibold">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-[280px]">
                              <div className="flex flex-col items-center justify-center h-full">
                                <Users className="h-12 w-12 mb-4 text-blue-300" />
                                <p className="text-lg font-medium text-blue-400">
                                  {recipientSearchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลผู้รับ"}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedRecipients.map((recipient) => (
                            <TableRow
                                key={recipient.id}
                                className="
                                  h-16
                                  border-b border-blue-100
                                  transition-all duration-300
                                  hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50
                                  even:bg-slate-50/50
                                "
                              >
                              <TableCell className="text-gray-500 font-medium">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4 text-blue-500" />
                                  {recipient.roomNumber}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                  <User className="h-4 w-4 text-green-500" />
                                  {recipient.fullname}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                  <Phone className="h-4 w-4 text-orange-500" />
                                  {recipient.phone}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-500 font-medium">
                                {formatDate(recipient.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleEdit(recipient)}
                                    className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-xs font-medium text-blue-700">แก้ไข</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(recipient)}
                                    className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    <span className="text-xs font-medium text-red-600">ลบ</span>
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
                      <div className="text-sm text-gray-500 font-medium">
                        แสดง <span className="text-blue-600">{((recipientPage - 1) * RECIPIENTS_PER_PAGE) + 1}-{Math.min(recipientPage * RECIPIENTS_PER_PAGE, recipients.length)}</span> จาก <span className="text-blue-600">{recipients.length}</span> คน
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={recipientPage === 1}
                          onClick={() => handleRecipientPageChange(recipientPage - 1)}
                          className="h-8 px-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40"
                        >
                          <span className="text-xs">‹ ก่อนหน้า</span>
                        </Button>
                        
                        <div className="flex items-center gap-1 mx-1">
                          {Array.from({ length: totalRecipientPages }, (_, i) => i + 1)
                            .filter(page => {
                              if (totalRecipientPages <= 5) return true;
                              if (page === 1 || page === totalRecipientPages) return true;
                              if (Math.abs(page - recipientPage) <= 1) return true;
                              return false;
                            })
                            .map((page, idx, arr) => (
                              <Fragment key={page}>
                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                  <span className="text-gray-400 px-1">...</span>
                                )}
                                <Button
                                  variant={recipientPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleRecipientPageChange(page)}
                                  className={`h-8 w-8 p-0 text-xs font-medium transition-all ${
                                    recipientPage === page 
                                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                                      : "border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                  }`}
                                >
                                  {page}
                                </Button>
                              </Fragment>
                            ))
                          }
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={recipientPage === totalRecipientPages || totalRecipientPages === 0}
                          onClick={() => handleRecipientPageChange(recipientPage + 1)}
                          className="h-8 px-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40"
                        >
                          <span className="text-xs">ถัดไป ›</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 rounded-2xl shadow-2xl px-8 py-8 max-w-sm w-full mx-4 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">ยืนยันการลบ</h2>
            <p className="text-gray-500 text-center mb-1">
              คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้รับ
            </p>
            <p className="text-gray-700 font-semibold text-center mb-1">
              "{selectedRecipient?.fullname}" ห้อง {selectedRecipient?.roomNumber}
            </p>
            <p className="text-red-400 text-sm text-center mb-6">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    ลบข้อมูล
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Recipient Dialog */}
      {editDialogOpen && !confirmCloseEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={handleTryCloseEdit}
          />
          <div className="relative bg-white/95 rounded-2xl shadow-2xl px-8 py-8 max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900">แก้ไขข้อมูลผู้รับ</h2>
                <p className="text-sm text-gray-500">ห้อง {selectedRecipient?.roomNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-green-500" />
                  ชื่อผู้รับ
                </label>
                <Input
                  value={editForm.fullname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullname: e.target.value }))}
                  placeholder="กรอกชื่อผู้รับ"
                  className="border-blue-200 focus:border-blue-400 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4 text-orange-500" />
                  เบอร์โทรศัพท์
                </label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  className="border-blue-200 focus:border-blue-400 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6">
              <Button
                variant="outline"
                onClick={handleTryCloseEdit}
                disabled={updating}
                className="rounded-xl border-gray-300 hover:bg-gray-50"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updating || !hasEditChanged}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    บันทึกการแก้ไข
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Close Edit Dialog */}
      {confirmCloseEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 rounded-2xl shadow-2xl px-8 py-8 max-w-sm w-full mx-4 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-5">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              ยกเลิกการแก้ไข?
            </h2>
            <p className="text-gray-500 text-center mb-6">
              คุณต้องการยกเลิกการแก้ไขข้อมูลผู้รับหรือไม่?
            </p>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => setConfirmCloseEditOpen(false)}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                แก้ไขต่อ
              </Button>
              <Button
                variant="outline"
                onClick={handleConfirmCloseEdit}
                className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {successPopup?.show && (
        <div className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm ${successPopup.type === 'error' ? 'z-[70]' : 'z-50'}`}>
          <div className="bg-white/95 rounded-2xl shadow-2xl px-10 py-8 max-w-sm w-full mx-4 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-200">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-lg ${
              successPopup.type === 'delete' ? 'bg-red-500' : successPopup.type === 'error' ? 'bg-amber-500' : 'bg-green-500'
            }`}>
              {successPopup.type === 'delete'
                ? <Trash2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                : successPopup.type === 'error'
                ? <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2.5} />
                : <Check className="w-14 h-14 text-white" strokeWidth={3} />
              }
            </div>

            <h2 className={`text-2xl font-extrabold mb-2 text-center ${
              successPopup.type === 'delete' ? 'text-red-700' : successPopup.type === 'error' ? 'text-amber-700' : 'text-gray-900'
            }`}>
              {successPopup.type === 'error' ? 'เกิดข้อผิดพลาด' : successPopup.message}
            </h2>

            <p className={`text-center ${
              successPopup.type === 'error' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {successPopup.type === 'delete'
                ? 'ข้อมูลถูกลบออกจากระบบแล้ว'
                : successPopup.type === 'error'
                ? successPopup.message
                : 'ข้อมูลได้รับการอัปเดตเรียบร้อยแล้ว'
              }
            </p>
          </div>
        </div>
      )}

      {/* Status Management Dialog */}
      {statusDialogOpen && selectedParcelForStatus && !confirmCloseStatusOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (!updatingParcelStatus && e.target === e.currentTarget) {
              if (selectedNewStatus) {
                setConfirmCloseStatusOpen(true);
              } else {
                setStatusDialogOpen(false);
                setSelectedParcelForStatus(null);
                setSelectedNewStatus(null);
              }
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900">จัดการสถานะพัสดุ</h2>
                  <p className="text-sm text-gray-500 truncate">
                    {selectedParcelForStatus.trackingNumber} · {selectedParcelForStatus.recipientName}
                  </p>
                </div>
              </div>
            </div>

            {/* Current status */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-1.5">สถานะปัจจุบัน</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                (selectedParcelForStatus.status === 'pending' || selectedParcelForStatus.status === 'notified')
                  ? 'bg-orange-100 text-orange-700'
                  : selectedParcelForStatus.status === 'collected'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {(selectedParcelForStatus.status === 'pending' || selectedParcelForStatus.status === 'notified') && <><Clock className="h-3.5 w-3.5" /> รอรับพัสดุ</>}
                {selectedParcelForStatus.status === 'collected' && <><CheckCircle className="h-3.5 w-3.5" /> รับพัสดุแล้ว</>}
                {selectedParcelForStatus.status === 'returned' && <><AlertTriangle className="h-3.5 w-3.5" /> ส่งคืนแล้ว</>}
              </span>
            </div>

            {/* Status selection */}
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500 tracking-wide mb-3">เลือกสถานะใหม่</p>
              <div className="space-y-2">
                {[
                  {
                    value: 'pending',
                    label: 'รอรับพัสดุ',
                    icon: <Clock className="h-4 w-4" />,
                    base: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
                    active: 'border-orange-400 bg-orange-100 text-orange-700',
                    checkActive: 'border-orange-400 bg-orange-400',
                  },
                  {
                    value: 'collected',
                    label: 'รับพัสดุแล้ว',
                    icon: <CheckCircle className="h-4 w-4" />,
                    base: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
                    active: 'border-green-500 bg-green-200 text-green-800',
                    checkActive: 'border-green-500 bg-green-500',
                  },
                  {
                    value: 'returned',
                    label: 'ส่งคืนแล้ว',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    base: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
                    active: 'border-red-500 bg-red-200 text-red-800',
                    checkActive: 'border-red-500 bg-red-500',
                  },
                ].map((option) => {
                  const isSelected = selectedNewStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (updatingParcelStatus) return;
                        setSelectedNewStatus(isSelected ? null : option.value);
                      }}
                      disabled={updatingParcelStatus}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                        isSelected ? option.active : option.base
                      } ${updatingParcelStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {option.icon}
                      <span className="flex-1 text-left">{option.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? option.checkActive : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedNewStatus) {
                    setConfirmCloseStatusOpen(true);
                  } else {
                    setStatusDialogOpen(false);
                    setSelectedParcelForStatus(null);
                    setSelectedNewStatus(null);
                  }
                }}
                disabled={updatingParcelStatus}
                className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => {
                  if (selectedNewStatus) handleStatusUpdate(selectedParcelForStatus.id.toString(), selectedNewStatus);
                }}
                disabled={
                  updatingParcelStatus ||
                  !selectedNewStatus
                }
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {updatingParcelStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    กำลังอัปเดต...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> 
                    อัปเดตสถานะ
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Close Status Dialog */}
      {confirmCloseStatusOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 rounded-2xl shadow-2xl px-8 py-8 max-w-sm w-full mx-4 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-5">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              ยกเลิกการแก้ไข?
            </h2>
            <p className="text-gray-500 text-center mb-6">
              คุณต้องการยกเลิกการอัปเดตสถานะหรือไม่?
            </p>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => setConfirmCloseStatusOpen(false)}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                แก้ไขต่อ
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmCloseStatusOpen(false);
                  setStatusDialogOpen(false);
                  setSelectedParcelForStatus(null);
                  setSelectedNewStatus(null);
                }}
                className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Parcel Status History Dialog */}
      {historyDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setHistoryDialogOpen(false);
              setSelectedParcelHistory(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900">ประวัติสถานะพัสดุ</h2>
                </div>
              </div>
            </div>

            {/* Parcel Info - tracking left, name right */}
            {selectedParcelHistory && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 bg-gray-200 px-2.5 py-1 rounded-lg truncate">
                  {selectedParcelHistory.parcel.trackingNumber}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 truncate">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  {selectedParcelHistory.parcel.recipientName}
                </span>
              </div>
            )}

            {/* History entries */}
            <div className="overflow-y-auto max-h-[55vh] px-6 py-4 min-h-[120px]">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
                </div>
              ) : selectedParcelHistory?.history?.length ? (
                <>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">สถานะปัจจุบัน</p>
                  <div className="space-y-2">
                    {selectedParcelHistory.history.map((entry, index) => {
                      const isWaiting = entry.status === 'pending' || entry.status === 'notified';
                      const isCollected = entry.status === 'collected';

                      const statusBadge = isWaiting
                        ? { label: 'รอรับพัสดุ', badgeClass: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock className="h-3.5 w-3.5" /> }
                        : isCollected
                        ? { label: 'รับพัสดุแล้ว', badgeClass: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-3.5 w-3.5" /> }
                        : { label: 'ส่งคืนแล้ว', badgeClass: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> };

                      return (
                        <div
                          key={entry.id}
                          className="w-full rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${statusBadge.badgeClass}`}>
                              {statusBadge.icon}
                              {statusBadge.label}
                            </span>
                            {index === 0 && (
                              <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">ล่าสุด</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                            <span>อัปเดตล่าสุด: {formatDate(entry.changedAt)}</span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-500 mt-1.5 italic">&quot;{entry.notes}&quot;</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Package className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">ไม่มีประวัติสถานะ</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <Button
                onClick={() => {
                  setHistoryDialogOpen(false);
                  setSelectedParcelHistory(null);
                }}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 