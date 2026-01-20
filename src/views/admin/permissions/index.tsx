import React, { useState, useMemo, useEffect } from "react";
import Card from "components/card";
import { 
  Lock,
  LockOpen,
  Search,
  Building,
  Home,
  User,
  Clock,
  Refresh,
  Plus
} from "tabler-icons-react";
import Toast from "components/toast/ToastNew";
import { blockApi } from "lib/api/block";
import { listMerchants, listFillials, listUsers } from "lib/api";

// Types
interface PermissionItem {
  id: number;
  name: string;
  phone?: string;
  passport?: string;
  status: "WORKING" | "BLOCKED";
  reason?: string;
  blockedAt?: string;
  blockedUntil?: string;
  createdAt: string;
  blockId?: number;
}

type TabType = "merchant" | "fillial" | "customer" | "workplace";

const Permissions = () => {
  const [activeTab, setActiveTab] = useState<TabType>("merchant");
  const [search, setSearch] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [fillials, setFillials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [blockForm, setBlockForm] = useState({
    entityId: 0,
    reason: "",
    duration: "",
    workplaceName: "",
  });
  const [entitySearch, setEntitySearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Har bir sahifada 20 ta block

  const durations = [
    { value: "7d", label: "7 kunlik" },
    { value: "10d", label: "10 kunlik" },
    { value: "1m", label: "1 oylik" },
    { value: "2m", label: "2 oylik" },
    { value: "3m", label: "3 oylik" },
    { value: "6m", label: "6 oylik" },
    { value: "1y", label: "1 yillik" },
    { value: "2y", label: "2 yillik" },
    { value: "3y", label: "3 yillik" },
    { value: "permanent", label: "Butunlay" },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // Load data on mount and when tab changes
  useEffect(() => {
    loadData();
    
    // Auto-refresh har 10 soniyada (real-time kabi ishlash uchun)
    const interval = setInterval(() => {
      loadData();
    }, 10000); // 10 soniya

    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load blocks
      let blockType: 'USER' | 'MERCHANT' | 'FILLIAL' | 'WORKPLACE' | undefined;
      if (activeTab === "merchant") blockType = "MERCHANT";
      else if (activeTab === "fillial") blockType = "FILLIAL";
      else if (activeTab === "customer") blockType = "USER";
      else if (activeTab === "workplace") blockType = "WORKPLACE";
      
      const blocksRes = await blockApi.getBlocks({ type: blockType, isActive: true });
      setBlocks(blocksRes.data);

      // Load relevant entities
      if (activeTab === "merchant") {
        const merchantsRes = await listMerchants();
        setMerchants(merchantsRes.items || []);
      } else if (activeTab === "fillial") {
        const filialsRes = await listFillials();
        setFillials(filialsRes.items || []);
      } else if (activeTab === "customer") {
        const usersRes = await listUsers();
        setUsers(usersRes.items || []);
      }
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
      showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get current data based on active tab
  const getCurrentData = (): PermissionItem[] => {
    let items: PermissionItem[] = [];

    if (activeTab === "merchant") {
      // Merge merchants with blocks
      items = merchants.filter(m => m.work_status === "BLOCKED").map(merchant => {
        const block = blocks.find(b => b.merchant_id === merchant.id);
        return {
          id: merchant.id,
          name: merchant.name || merchant.merchant_name,
          phone: merchant.phone,
          status: "BLOCKED" as const,
          reason: block?.reason,
          blockedAt: block?.createdAt,
          blockedUntil: block?.endDate,
          createdAt: merchant.createdAt,
          blockId: block?.id,
        };
      });
    } else if (activeTab === "fillial") {
      items = fillials.filter(f => f.work_status === "BLOCKED").map(fillial => {
        const block = blocks.find(b => b.fillial_id === fillial.id);
        return {
          id: fillial.id,
          name: fillial.name || fillial.fillial_name,
          phone: fillial.phone,
          status: "BLOCKED" as const,
          reason: block?.reason,
          blockedAt: block?.createdAt,
          blockedUntil: block?.endDate,
          createdAt: fillial.createdAt,
          blockId: block?.id,
        };
      });
    } else if (activeTab === "customer") {
      items = users.filter(u => u.work_status === "BLOCKED").map(user => {
        const block = blocks.find(b => b.user_id === user.id);
        return {
          id: user.id,
          name: user.full_name || user.name,
          phone: user.phone,
          passport: user.passport,
          status: "BLOCKED" as const,
          reason: block?.reason,
          blockedAt: block?.createdAt,
          blockedUntil: block?.endDate,
          createdAt: user.createdAt,
          blockId: block?.id,
        };
      });
    } else if (activeTab === "workplace") {
      // Workplace blocks - only show blocks with type WORKPLACE
      items = blocks
        .filter(b => b.type === "WORKPLACE" && b.workplace_name)
        .map(block => ({
          id: block.id,
          name: block.workplace_name,
          phone: "",
          status: "BLOCKED" as const,
          reason: block.reason,
          blockedAt: block.createdAt,
          blockedUntil: block.endDate,
          createdAt: block.createdAt,
          blockId: block.id,
        }));
    }

    return items;
  };

  // Filter data - show only blocked items
  const filteredData = useMemo(() => {
    let data = getCurrentData();
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.phone?.toLowerCase().includes(searchLower) ||
        item.passport?.toLowerCase().includes(searchLower)
      );
    }

    return data;
  }, [activeTab, search, blocks, merchants, fillials, users, getCurrentData]);

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Reset to first page when tab, search or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, filteredData.length]);

  const handleUnblock = async (blockId: number | undefined, itemId: number) => {
    if (!blockId) {
      showToast('Block ID topilmadi', 'error');
      return;
    }

    try {
      setLoading(true);
      await blockApi.deactivateBlock(blockId);
      showToast('Muvaffaqiyatli ochlidi!', 'success');
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Ochishda xatolik:', error);
      showToast(error.response?.data?.message || 'Ochishda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = (duration: string): Date | null => {
    if (duration === "permanent") return null;
    
    const now = new Date();
    const match = duration.match(/^(\d+)([dmy])$/);
    if (!match) return null;
    
    const amount = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === "d") {
      now.setDate(now.getDate() + amount);
    } else if (unit === "m") {
      now.setMonth(now.getMonth() + amount);
    } else if (unit === "y") {
      now.setFullYear(now.getFullYear() + amount);
    }
    
    return now;
  };

  const handleAddBlock = async () => {
    if (activeTab === "workplace") {
      if (!blockForm.workplaceName.trim() || !blockForm.reason.trim() || !blockForm.duration) {
        showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'warning');
        return;
      }
    } else {
      if (!blockForm.entityId || !blockForm.reason.trim() || !blockForm.duration) {
        showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'warning');
        return;
      }
    }

    try {
      setLoading(true);
      
      const endDate = calculateEndDate(blockForm.duration);
      const blockData: any = {
        reason: blockForm.reason,
        isActive: true,
        isPermanent: blockForm.duration === "permanent",
      };

      if (endDate) {
        blockData.endDate = endDate.toISOString();
      }

      // Add entity ID based on type
      if (activeTab === "merchant") {
        blockData.type = "MERCHANT";
        blockData.merchant_id = blockForm.entityId;
      } else if (activeTab === "fillial") {
        blockData.type = "FILLIAL";
        blockData.fillial_id = blockForm.entityId;
      } else if (activeTab === "customer") {
        blockData.type = "USER";
        blockData.user_id = blockForm.entityId;
      } else if (activeTab === "workplace") {
        blockData.type = "WORKPLACE";
        blockData.workplace_name = blockForm.workplaceName;
      }

      await blockApi.createBlock(blockData);
      showToast('Block muvaffaqiyatli qo\'shildi!', 'success');
      setShowAddModal(false);
      setEntitySearch("");
      setBlockForm({ entityId: 0, reason: "", duration: "", workplaceName: "" });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Block qo\'shishda xatolik:', error);
      showToast(error.response?.data?.message || 'Block qo\'shishda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}.${day}.${year}`;
  };

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 30) {
      return `${Math.floor(diffInDays / 30)} oy`;
    } else if (diffInDays > 0) {
      return `${diffInDays} kun`;
    } else if (diffInDays === 0 && diffInHours > 0) {
      return `${diffInHours} soat`;
    } else if (diffInDays === 0 && diffInHours === 0 && diffInMinutes > 0) {
      return `${diffInMinutes} daqiqa`;
    } else if (diffInDays < 0) {
      const absDays = Math.abs(diffInDays);
      if (absDays > 30) {
        return `${Math.floor(absDays / 30)} oy oldin`;
      } else if (absDays > 0) {
        return `${absDays} kun oldin`;
      } else {
        const absHours = Math.abs(diffInHours);
        if (absHours > 0) {
          return `${absHours} soat oldin`;
        } else {
          const absMinutes = Math.abs(diffInMinutes);
          return absMinutes > 0 ? `${absMinutes} daqiqa oldin` : "Hozir";
        }
      }
    }
    return "";
  };

  const getTimeColor = (dateStr?: string, isPast: boolean = false) => {
    if (!dateStr) return "text-gray-500";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (isPast) return "text-red-600 dark:text-red-400";
    
    if (diffInDays < 0) return "text-gray-500 dark:text-gray-500"; // expired
    if (diffInDays <= 7) return "text-orange-600 dark:text-orange-400"; // expiring soon
    if (diffInDays <= 30) return "text-yellow-600 dark:text-yellow-400"; // month away
    return "text-blue-600 dark:text-blue-400"; // far future
  };

  const tabs = [
    { key: "merchant" as TabType, label: "Merchantlar", icon: <Building className="h-5 w-5" /> },
    { key: "fillial" as TabType, label: "Filiallar", icon: <Home className="h-5 w-5" /> },
    { key: "customer" as TabType, label: "Mijozlar", icon: <User className="h-5 w-5" /> },
    { key: "workplace" as TabType, label: "Ish joylari", icon: <Clock className="h-5 w-5" /> },
  ];

  return (
    <div className="mt-3 w-full">
      <Card extra="w-full p-6">
        {/* Header */}
        <header className="mb-6">
          <div>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Ruxsat va Blocklar
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Blocklangan ob'ektlarni ko'rish va boshqarish
            </p>
          </div>
        </header>

        {/* Tabs with individual actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAddModal(true);
                setEntitySearch("");
                setBlockForm({ entityId: 0, reason: "", duration: "", workplaceName: "" });
              }}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 hover:shadow-lg active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {activeTab === "merchant" && "Merchant bloklash"}
              {activeTab === "fillial" && "Filial bloklash"}
              {activeTab === "customer" && "Mijoz bloklash"}
              {activeTab === "workplace" && "Ish joyi bloklash"}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
            >
              <Refresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yangilash
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-700 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        {loading && (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="pb-4 pr-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Ma'lumot
                </th>
                <th className="pb-4 px-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Sabab
                </th>
                <th className="pb-4 px-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Blocklangan
                </th>
                <th className="pb-4 px-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Tugash
                </th>
                <th className="pb-4 pl-4 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-100 transition-all hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent dark:border-gray-700 dark:hover:from-navy-800 dark:hover:to-transparent ${
                    index % 2 === 0 ? 'bg-white dark:bg-navy-900' : 'bg-gray-50/50 dark:bg-navy-800/50'
                  }`}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-md">
                        {activeTab === "merchant" && <Building className="h-5 w-5 text-white" />}
                        {activeTab === "fillial" && <Home className="h-5 w-5 text-white" />}
                        {activeTab === "customer" && <User className="h-5 w-5 text-white" />}
                        {activeTab === "workplace" && <Clock className="h-5 w-5 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-navy-700 dark:text-white truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.phone && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              📱 {item.phone}
                            </span>
                          )}
                          {item.passport && (
                            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              🆔 {item.passport}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2" title={item.reason}>
                        {item.reason || "-"}
                      </p>
                      {item.reason && item.reason.length > 50 && (
                        <button
                          onClick={() => {
                            setSelectedBlock(item);
                            setShowViewModal(true);
                          }}
                          className="mt-1 text-xs text-brand-500 hover:text-brand-600 font-medium"
                        >
                          Batafsil ko'rish →
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                        <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-700 dark:text-white">
                          {formatDate(item.blockedAt)}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {getRelativeTime(item.blockedAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {item.blockedUntil ? (
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          new Date(item.blockedUntil) < new Date() 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : 'bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                          <Clock className={`h-4 w-4 ${getTimeColor(item.blockedUntil)}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-700 dark:text-white">
                            {formatDate(item.blockedUntil)}
                          </p>
                          <p className={`text-xs font-medium ${getTimeColor(item.blockedUntil)}`}>
                            {new Date(item.blockedUntil) < new Date() 
                              ? "Muddati o'tgan" 
                              : `${getRelativeTime(item.blockedUntil)} ichida`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-purple-700 dark:text-purple-400">
                            Butunlay
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-500">
                            Muddat yo'q
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 pl-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBlock(item);
                          setShowViewModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ko'rish
                      </button>
                      <button
                        onClick={() => handleUnblock(item.blockId, item.id)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        <LockOpen className="h-4 w-4" />
                        Ochish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-navy-800">
                <Lock className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="mt-4 text-base font-medium text-gray-600 dark:text-gray-400">
                Blocklangan ob'ektlar topilmadi
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                {activeTab === "merchant" && "Hech qanday merchant bloklanmagan"}
                {activeTab === "fillial" && "Hech qanday filial bloklanmagan"}
                {activeTab === "customer" && "Hech qanday mijoz bloklanmagan"}
                {activeTab === "workplace" && "Hech qanday ish joyi bloklanmagan"}
              </p>
            </div>
          )}
          </div>
        )}

        {/* Pagination */}
        {!loading && paginatedData.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredData.length} tadan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} ko'rsatilmoqda
            </div>
            
            <div className="flex items-center gap-2">
              {/* Page size selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              >
                <option value={10}>10 ta</option>
                <option value={20}>20 ta</option>
                <option value={50}>50 ta</option>
                <option value={100}>100 ta</option>
              </select>

              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:hover:bg-navy-800"
              >
                Oldingi
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-brand-500 text-white'
                          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:hover:bg-navy-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:hover:bg-navy-800"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </Card>

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        type={toastType}
      />

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-navy-700 dark:text-white">Block qo'shish</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activeTab === "merchant" && "Merchant bloklash"}
                  {activeTab === "fillial" && "Filial bloklash"}
                  {activeTab === "customer" && "Mijoz bloklash"}
                  {activeTab === "workplace" && "Ish joyi bloklash"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEntitySearch("");
                  setBlockForm({ entityId: 0, reason: "", duration: "", workplaceName: "" });
                }}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">

              {/* Entity Selector with Search OR Workplace Text Input */}
              {activeTab === "workplace" ? (
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                    Ish joyi nomini kiriting *
                  </label>
                  <input
                    type="text"
                    value={blockForm.workplaceName}
                    onChange={(e) => setBlockForm({ ...blockForm, workplaceName: e.target.value })}
                    placeholder="Masalan: Artel, Samsung Plaza, Oliy Majlis..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white placeholder:text-gray-400"
                  />
                  {blockForm.workplaceName.trim() && (
                    <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">
                      ✓ "{blockForm.workplaceName}" nomli ish joyi blocklanadi
                    </p>
                  )}
                </div>
              ) : (
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  {activeTab === "merchant" && "Merchant tanlang *"}
                  {activeTab === "fillial" && "Filial tanlang *"}
                  {activeTab === "customer" && "Mijoz tanlang *"}
                </label>
                <div className="relative mb-3 w-full">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={blockForm.entityId ? 
                      (() => {
                        if (activeTab === "merchant") {
                          const m = merchants.find(x => x.id === blockForm.entityId);
                          return m?.name || m?.merchant_name || "";
                        } else if (activeTab === "fillial") {
                          const f = fillials.find(x => x.id === blockForm.entityId);
                          return f?.name || f?.fillial_name || "";
                        } else if (activeTab === "customer") {
                          const u = users.find(x => x.id === blockForm.entityId);
                          return u?.full_name || u?.name || "";
                        }
                        return "";
                      })()
                      : entitySearch
                    }
                    onChange={(e) => {
                      setEntitySearch(e.target.value);
                      setBlockForm({ ...blockForm, entityId: 0 });
                    }}
                    placeholder="Qidiruv..."
                    className="w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="w-full rounded-lg border-2 border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-900" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  <select
                    value={blockForm.entityId}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      setBlockForm({ ...blockForm, entityId: selectedId });
                      setEntitySearch("");
                    }}
                    size={8}
                    className="w-full px-0 py-0 text-sm outline-none dark:text-white cursor-pointer"
                    style={{ border: 'none', background: 'transparent', minHeight: '200px', width: '100%' }}
                  >
                    <option value={0} className="py-3 px-4 bg-gray-50 dark:bg-navy-800" disabled>— Tanlang —</option>
                    {activeTab === "merchant" && merchants
                      .filter(m => m.work_status !== "BLOCKED")
                      .filter(m => !entitySearch || (m.name || m.merchant_name || "").toLowerCase().includes(entitySearch.toLowerCase()))
                      .map(m => (
                        <option 
                          key={m.id} 
                          value={m.id} 
                          className="py-3 px-4 cursor-pointer hover:bg-brand-50 dark:hover:bg-navy-700"
                          style={{ 
                            backgroundColor: blockForm.entityId === m.id ? '#4318FF' : 'transparent',
                            color: blockForm.entityId === m.id ? 'white' : 'inherit',
                            fontWeight: blockForm.entityId === m.id ? '600' : 'normal'
                          }}
                        >
                          {m.name || m.merchant_name}
                        </option>
                      ))
                    }
                    {activeTab === "fillial" && fillials
                      .filter(f => f.work_status !== "BLOCKED")
                      .filter(f => !entitySearch || (f.name || f.fillial_name || "").toLowerCase().includes(entitySearch.toLowerCase()))
                      .map(f => (
                        <option 
                          key={f.id} 
                          value={f.id} 
                          className="py-3 px-4 cursor-pointer hover:bg-brand-50 dark:hover:bg-navy-700"
                          style={{ 
                            backgroundColor: blockForm.entityId === f.id ? '#4318FF' : 'transparent',
                            color: blockForm.entityId === f.id ? 'white' : 'inherit',
                            fontWeight: blockForm.entityId === f.id ? '600' : 'normal'
                          }}
                        >
                          {f.name || f.fillial_name}
                        </option>
                      ))
                    }
                    {activeTab === "customer" && users
                      .filter(u => u.work_status !== "BLOCKED")
                      .filter(u => !entitySearch || 
                        (u.full_name || u.name || "").toLowerCase().includes(entitySearch.toLowerCase()) ||
                        (u.phone || "").includes(entitySearch)
                      )
                      .map(u => (
                        <option 
                          key={u.id} 
                          value={u.id} 
                          className="py-3 px-4 cursor-pointer hover:bg-brand-50 dark:hover:bg-navy-700"
                          style={{ 
                            backgroundColor: blockForm.entityId === u.id ? '#4318FF' : 'transparent',
                            color: blockForm.entityId === u.id ? 'white' : 'inherit',
                            fontWeight: blockForm.entityId === u.id ? '600' : 'normal'
                          }}
                        >
                          {u.full_name || u.name} ({u.phone})
                        </option>
                      ))
                    }

                  </select>
                </div>
                {blockForm.entityId > 0 && (
                  <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">
                    ✓ Tanlandi
                  </p>
                )}
              </div>
              )}
              {/* End of entity selector conditional */}

              {/* Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Sabab *
                </label>
                <textarea
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Block qo'yish sababini kiriting..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                />
              </div>

              {/* Timer Duration */}
              <div>
                <label className="mb-3 block text-sm font-bold text-navy-700 dark:text-white">
                  Muddat (Timer) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {durations.map((duration) => (
                    <button
                      key={duration.value}
                      type="button"
                      onClick={() => setBlockForm({ ...blockForm, duration: duration.value })}
                      className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                        blockForm.duration === duration.value
                          ? duration.value === "permanent"
                            ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl ring-4 ring-purple-200 dark:ring-purple-900"
                            : "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl ring-4 ring-brand-200 dark:ring-brand-900"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 dark:from-navy-700 dark:to-navy-600 dark:text-gray-300 dark:hover:from-navy-600 dark:hover:to-navy-500"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
                {blockForm.duration && (
                  <div className="mt-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {blockForm.duration === "permanent" 
                        ? "⚡ Doimiy block - muddat yo'q" 
                        : (() => {
                            const date = calculateEndDate(blockForm.duration);
                            if (!date) return "";
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const year = date.getFullYear();
                            const duration = durations.find(d => d.value === blockForm.duration)?.label;
                            return `${month}.${day}.${year} - ⏰ ${duration}`;
                          })()
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-navy-700">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEntitySearch("");
                    setBlockForm({ entityId: 0, reason: "", duration: "", workplaceName: "" });
                  }}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddBlock}
                  disabled={
                    (activeTab === "workplace" 
                      ? (!blockForm.workplaceName.trim() || !blockForm.reason.trim() || !blockForm.duration) 
                      : (!blockForm.entityId || !blockForm.reason.trim() || !blockForm.duration)
                    ) || loading
                  }
                  className="flex-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Yuklanmoqda...
                    </span>
                  ) : (
                    'Block qo\'shish'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Block Details Modal */}
      {showViewModal && selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-md">
                  {activeTab === "merchant" && <Building className="h-6 w-6 text-white" />}
                  {activeTab === "fillial" && <Home className="h-6 w-6 text-white" />}
                  {activeTab === "customer" && <User className="h-6 w-6 text-white" />}
                  {activeTab === "workplace" && <Clock className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                    Block Ma'lumotlari
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Batafsil ko'rish
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedBlock(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Nomi</p>
                <p className="text-base font-bold text-navy-700 dark:text-white">{selectedBlock.name}</p>
              </div>

              {/* Phone and Passport */}
              {(selectedBlock.phone || selectedBlock.passport) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedBlock.phone && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Telefon</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">📱 {selectedBlock.phone}</p>
                    </div>
                  )}
                  {selectedBlock.passport && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Pasport</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">🆔 {selectedBlock.passport}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Block Sababi</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedBlock.reason || "Sabab ko'rsatilmagan"}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Blocklangan</p>
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">{formatDate(selectedBlock.blockedAt)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{getRelativeTime(selectedBlock.blockedAt)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Tugash sanasi</p>
                  {selectedBlock.blockedUntil ? (
                    <>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">{formatDate(selectedBlock.blockedUntil)}</p>
                      <p className={`text-xs font-medium mt-1 ${getTimeColor(selectedBlock.blockedUntil)}`}>
                        {new Date(selectedBlock.blockedUntil) < new Date() 
                          ? "Muddati o'tgan" 
                          : `${getRelativeTime(selectedBlock.blockedUntil)} ichida`}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-400">Butunlay (Muddat yo'q)</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-navy-700">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBlock(null);
                  }}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
                >
                  Yopish
                </button>
                <button
                  onClick={() => {
                    handleUnblock(selectedBlock.blockId, selectedBlock.id);
                    setShowViewModal(false);
                    setSelectedBlock(null);
                  }}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <LockOpen className="h-4 w-4" />
                    Block dan ochish
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
