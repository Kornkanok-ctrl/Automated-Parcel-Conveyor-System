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
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { apiService, type Parcel, type AdminRecipient, type UpdateRecipientRequest } from "../../services/api";
import { useMemo } from "react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [recipients, setRecipients] = useState<AdminRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  
  // Recipients management states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateRecipientRequest>({ fullname: "", phone: "" });
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<AdminRecipient | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setUpdatingStatus(prev => ({ ...prev, [parcelId]: true }));
      
      const response = await apiService.updateParcelStatus(parseInt(parcelId), newStatus);
      
      if (response.success) {
        setParcels(prevParcels => 
          prevParcels.map(parcel => 
            parcel.id.toString() === parcelId
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
        console.log("Admin not logged in, redirecting...");
        onLogout();
        navigate("/login");
        return;
      }

      await Promise.all([loadParcels(), loadRecipients()]);
    } catch (err) {
      console.error("Load data error:", err);
      
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

  // Recipients management functions
  const handleEdit = (recipient: AdminRecipient) => {
    setEditingId(recipient.id);
    setEditForm({
      fullname: recipient.fullname,
      phone: recipient.phone
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ fullname: "", phone: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setUpdating(true);
      const response = await apiService.updateRecipient(editingId, editForm);

      if (response.success) {
        setRecipients(prev => 
          prev.map(recipient => 
            recipient.id === editingId 
              ? response.recipient
              : recipient
          )
        );
        setEditingId(null);
        setEditForm({ fullname: "", phone: "" });
      }
    } catch (err) {
      console.error("Update recipient error:", err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัพเดต');
    } finally {
      setUpdating(false);
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
        setRecipients(prev => prev.filter(r => r.id !== selectedRecipient.id));
        setDeleteDialogOpen(false);
        setSelectedRecipient(null);
      }
    } catch (err) {
      console.error("Delete recipient error:", err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    console.log('Dashboard mounted, checking authentication...');
    
    if (!apiService.isAdminLoggedIn()) {
      console.log('Not authenticated, redirecting to login...');
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
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search with debounce for recipients
  useEffect(() => {
    if (!apiService.isAdminLoggedIn()) return;
    
    const timeoutId = setTimeout(() => {
      loadRecipients().catch(console.error);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [recipientSearchQuery]);

  // Status mapping and calculations
  type ParcelStatus = "waiting" | "success" | "failed";
  const statusMap: Record<ParcelStatus, { label: string; color: string; icon: React.ReactElement }> = {
    waiting: { label: "รอรับสินค้า", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Clock className="h-3 w-3" /> },
    success: { label: "รับสินค้าแล้ว", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
    failed: { label: "ส่งคืนแล้ว", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" /> },
  };

  function mapParcelStatus(status: Parcel["status"]): ParcelStatus {
    if (status === "pending") return "waiting";
    if (status === "notified") return "waiting";
    if (status === "collected") return "success";
    if (status === "returned") return "failed";
    return "waiting";
  }

  const tableData = useMemo(() =>
    parcels.map((p) => ({
      ...p,
      displayStatus: mapParcelStatus(p.status),
      timestamp: p.createdAt ? new Date(p.createdAt) : new Date(),
    })),
    [parcels]
  );

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
            onClick={() => handleStatusUpdate(parcel.id.toString(), 'returned')}
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
          onClick={() => handleStatusUpdate(parcel.id.toString(), 'collected')}
          disabled={isUpdating || !canCollect}
          className="h-7 w-7 p-0 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400"
          title="รับสินค้า"
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(parcel.id.toString(), 'returned')}
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
                ระบบจัดการพัสดุและผู้รับ
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
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <Card className="bg-blue-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                พัสดุทั้งหมด
              </CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-400">รายการ</p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">
                รอรับสินค้า
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.waiting}</div>
              <p className="text-xs text-orange-400">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-green-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-900">
                รับสินค้าแล้ว
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.success}</div>
              <p className="text-xs text-green-500">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-red-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-900">
                ส่งคืนแล้ว
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{stats.failed}</div>
              <p className="text-xs text-red-500">รายการ</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-100 border-0 shadow hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">
                ผู้รับทั้งหมด
              </CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{recipients.length}</div>
              <p className="text-xs text-purple-500">คน</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Parcels and Recipients Management */}
        <Tabs defaultValue="parcels" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 mb-8">
            <TabsTrigger value="parcels" className="data-[state=active]:bg-white">
              <Package className="h-4 w-4 mr-2" />
              จัดการพัสดุ
            </TabsTrigger>
            <TabsTrigger value="recipients" className="data-[state=active]:bg-white">
              <Users className="h-4 w-4 mr-2" />
              จัดการผู้รับ
            </TabsTrigger>
          </TabsList>

          {/* Parcels Tab */}
          <TabsContent value="parcels">
            <Card className="bg-white/90 border-0 shadow-xl">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-blue-900">รายการพัสดุ ({parcels.length} รายการ)</CardTitle>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <Input
                      placeholder="ค้นหาพัสดุ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                            <TableCell colSpan={7} className="py-12 text-center text-blue-300">
                              <Package className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                              <p className="text-lg font-medium">
                                {searchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลพัสดุ"}
                              </p>
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
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients">
            <Card className="bg-white/90 border-0 shadow-xl">
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-blue-900">จัดการผู้รับ ({recipients.length} คน)</CardTitle>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <Input
                      placeholder="ค้นหาชื่อ, เบอร์โทร, หรือห้อง..."
                      value={recipientSearchQuery}
                      onChange={(e) => setRecipientSearchQuery(e.target.value)}
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
                          <TableHead className="text-blue-900 font-semibold">ห้อง</TableHead>
                          <TableHead className="text-blue-900 font-semibold">ชื่อผู้รับ</TableHead>
                          <TableHead className="text-blue-900 font-semibold">เบอร์โทร</TableHead>
                          <TableHead className="text-blue-900 font-semibold">วันที่สร้าง</TableHead>
                          <TableHead className="text-blue-900 font-semibold">จัดการ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-12 text-center text-blue-300">
                              <Users className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                              <p className="text-lg font-medium">
                                {recipientSearchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลผู้รับ"}
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recipients.map((recipient) => (
                            <TableRow key={recipient.id} className="hover:bg-blue-50/50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4 text-blue-500" />
                                  {recipient.roomNumber}
                                </div>
                              </TableCell>
                              <TableCell>
                                {editingId === recipient.id ? (
                                  <Input
                                    value={editForm.fullname}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, fullname: e.target.value }))}
                                    className="w-full"
                                    placeholder="ชื่อผู้รับ"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-green-500" />
                                    {recipient.fullname}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {editingId === recipient.id ? (
                                  <Input
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full"
                                    placeholder="เบอร์โทร"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-orange-500" />
                                    {recipient.phone}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-blue-400 text-sm">
                                {formatDate(recipient.createdAt)}
                              </TableCell>
                              <TableCell>
                                {editingId === recipient.id ? (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEdit}
                                      disabled={updating}
                                      className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                    >
                                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      disabled={updating}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(recipient)}
                                      className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDelete(recipient)}
                                      className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-700">ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบข้อมูลผู้รับ "{selectedRecipient?.fullname}" ห้อง {selectedRecipient?.roomNumber}?
              <br />
              <span className="text-red-500 font-medium">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              ลบข้อมูล
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}