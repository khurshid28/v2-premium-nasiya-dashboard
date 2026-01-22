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
  Plus,
  Phone
} from "tabler-icons-react";
import Toast from "components/toast/ToastNew";
import { blockApi } from "lib/api/block";
import { listMerchants, listFillials, listUsers } from "lib/api";
import apiClient from "lib/api/index";

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
    workplaceId: 0,
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
      console.log('📊 Loading permissions data for tab:', activeTab);
      
      // Load blocks
      let blockType: 'USER' | 'MERCHANT' | 'FILLIAL' | 'WORKPLACE' | undefined;
      if (activeTab === "merchant") blockType = "MERCHANT";
      else if (activeTab === "fillial") blockType = "FILLIAL";
      else if (activeTab === "customer") blockType = "USER";
      else if (activeTab === "workplace") blockType = "WORKPLACE";
      
      console.log('🔍 Fetching blocks with type:', blockType);
      // Jadvalda faqat AKTIV blocklar ko'rsatish
      const blocksRes = await blockApi.getBlocks({ type: blockType, isActive: true });
      console.log('✅ Blocks loaded (active only):', blocksRes.data.length);
      setBlocks(blocksRes.data);

      // Load relevant entities (modal uchun BARCHA entitylar kerak)
      if (activeTab === "merchant") {
        console.log('🏢 Fetching ALL merchants...');
        const merchantsRes = await listMerchants();
        console.log('✅ Merchants loaded:', merchantsRes.items?.length || 0);
        setMerchants(merchantsRes.items || []);
        
        // Workplace blocklarni ham olib qo'yamiz (modal uchun)
        const workplaceRes = await blockApi.getBlocks({ type: 'WORKPLACE' });
        console.log('📋 All workplace blocks loaded:', workplaceRes.data.length);
      } else if (activeTab === "fillial") {
        console.log('🏠 Fetching ALL fillials...');
        const filialsRes = await listFillials();
        console.log('✅ Fillials loaded:', filialsRes.items?.length || 0);
        setFillials(filialsRes.items || []);
      } else if (activeTab === "customer") {
        console.log('👤 Fetching ALL users...');
        const usersRes = await listUsers();
        console.log('✅ Users loaded:', usersRes.items?.length || 0);
        setUsers(usersRes.items || []);
      } else if (activeTab === "workplace") {
        console.log('🏢 Loading all workplaces from database...');
        try {
          // BARCHA workplace lar ni olish (database dan)
          const workplacesRes = await apiClient.get('/client/workplaces/all');
          const data = workplacesRes.data?.value || workplacesRes.data || [];
          console.log('✅ Workplaces loaded from database:', data.length);
          
          const mappedWorkplaces = data
            .map((w: any) => ({
              id: w.id,
              name: w.name,
              address: w.address,
              phone: w.phone
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          
          console.log('📋 Workplaces:', mappedWorkplaces);
          setMerchants(mappedWorkplaces);
        } catch (err) {
          console.error('❌ Failed to load workplaces from database:', err);
          console.log('⚠️ Fallback: Loading from blocks...');
          
          // Fallback: Blocklardan olish
          try {
            const allWorkplaceBlocks = await blockApi.getBlocks({ type: 'WORKPLACE' });
            const workplaceMap = new Map<number, any>();
            
            allWorkplaceBlocks.data.forEach((block: any) => {
              if (block.workplace_id && block.workplace) {
                workplaceMap.set(block.workplace_id, {
                  id: block.workplace_id,
                  name: block.workplace.name || block.workplace_name
                });
              } else if (block.workplace_name) {
                // Eski format - faqat nom
                workplaceMap.set(block.id, {
                  id: 0,
                  name: block.workplace_name,
                  _oldFormat: true
                });
              }
            });
            
            const uniqueWorkplaces = Array.from(workplaceMap.values())
              .sort((a, b) => a.name.localeCompare(b.name));
            
            console.log('✅ Fallback workplaces:', uniqueWorkplaces.length);
            setMerchants(uniqueWorkplaces);
          } catch (fallbackErr) {
            console.error('❌ Fallback also failed:', fallbackErr);
            setMerchants([]);
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Ma\'lumotlarni yuklashda xatolik:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi: ' + (error.message || 'Noma\'lum xato'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get current data based on active tab
  const getCurrentData = (): PermissionItem[] => {
    let items: PermissionItem[] = [];

    if (activeTab === "merchant") {
      // Show all active blocks for merchants
      console.log('🏢 Processing merchant blocks:', blocks.filter(b => b.type === "MERCHANT").length);
      console.log('📋 Available merchants:', merchants.length);
      
      items = blocks
        .filter(b => b.type === "MERCHANT" && b.merchant_id)
        .map(block => {
          const merchant = merchants.find(m => m.id === block.merchant_id);
          console.log(`🔍 Block merchant_id: ${block.merchant_id}, Found:`, merchant ? `${merchant.name || merchant.merchant_name}` : 'NOT FOUND');
          
          return {
            id: block.merchant_id,
            name: merchant?.name || merchant?.merchant_name || block.merchant?.name || block.merchant?.merchant_name || `Merchant #${block.merchant_id}`,
            phone: merchant?.phone || block.merchant?.phone,
            status: "BLOCKED" as const,
            reason: block?.reason,
            blockedAt: block?.createdAt,
            blockedUntil: block?.endDate,
            createdAt: block.createdAt,
            blockId: block?.id,
          };
        });
    } else if (activeTab === "fillial") {
      // Show all active blocks for fillials
      console.log('🏠 Processing fillial blocks:', blocks.filter(b => b.type === "FILLIAL").length);
      console.log('📋 Available fillials:', fillials.length);
      
      items = blocks
        .filter(b => b.type === "FILLIAL" && b.fillial_id)
        .map(block => {
          const fillial = fillials.find(f => f.id === block.fillial_id);
          console.log(`🔍 Block fillial_id: ${block.fillial_id}, Found:`, fillial ? `${fillial.name || fillial.fillial_name}` : 'NOT FOUND');
          
          return {
            id: block.fillial_id,
            name: fillial?.name || fillial?.fillial_name || block.fillial?.name || block.fillial?.fillial_name || `Fillial #${block.fillial_id}`,
            phone: fillial?.phone || block.fillial?.phone,
            status: "BLOCKED" as const,
            reason: block?.reason,
            blockedAt: block?.createdAt,
            blockedUntil: block?.endDate,
            createdAt: block.createdAt,
            blockId: block?.id,
          };
        });
    } else if (activeTab === "customer") {
      // Show all active blocks for users
      console.log('👤 Processing user blocks:', blocks.filter(b => b.type === "USER").length);
      console.log('📋 Available users:', users.length);
      
      items = blocks
        .filter(b => b.type === "USER" && b.user_id)
        .map(block => {
          const user = users.find(u => u.id === block.user_id);
          console.log(`🔍 Block user_id: ${block.user_id}, Found:`, user ? `${user.fullname || user.full_name || user.name}` : 'NOT FOUND');
          
          return {
            id: block.user_id,
            name: user?.fullname || user?.full_name || user?.name || block.user?.fullname || block.user?.full_name || block.user?.name || `Mijoz #${block.user_id}`,
            phone: user?.phone || block.user?.phone,
            passport: user?.passport || block.user?.passport,
            status: "BLOCKED" as const,
            reason: block?.reason,
            blockedAt: block?.createdAt,
            blockedUntil: block?.endDate,
            createdAt: block.createdAt,
            blockId: block?.id,
          };
        });
    } else if (activeTab === "workplace") {
      // Workplace blocks - only show blocks with type WORKPLACE
      items = blocks
        .filter(b => b.type === "WORKPLACE")
        .map(block => ({
          id: block.workplace_id || block.id,
          name: block.workplace?.name || block.workplace_name || `Workplace #${block.workplace_id || block.id}`,
          phone: block.workplace?.phone || "",
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
        if (blockForm.workplaceId) {
          blockData.workplace_id = blockForm.workplaceId;
        }
        blockData.workplace_name = blockForm.workplaceName; // Fallback
      }

      await blockApi.createBlock(blockData);
      showToast('Block muvaffaqiyatli qo\'shildi!', 'success');
      setShowAddModal(false);
      setEntitySearch("");
      setBlockForm({ entityId: 0, reason: "", duration: "", workplaceId: 0, workplaceName: "" });
      
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
                setBlockForm({ entityId: 0, reason: "", duration: "", workplaceId: 0, workplaceName: "" });
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
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            ID: {item.id}
                          </span>
                          {activeTab === "merchant" && (
                            <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              Merchant
                            </span>
                          )}
                          {activeTab === "fillial" && (
                            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Filial
                            </span>
                          )}
                          {activeTab === "customer" && (
                            <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Mijoz
                            </span>
                          )}
                          {activeTab === "workplace" && (
                            <span className="inline-flex items-center rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              Ish joyi
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-navy-700 dark:text-white truncate text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.phone && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <Phone className="h-3.5 w-3.5" />
                              <span className="font-medium">{item.phone}</span>
                            </span>
                          )}
                          {item.passport && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              <span>🆔</span>
                              <span>{item.passport}</span>
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
                  setBlockForm({ entityId: 0, reason: "", duration: "", workplaceId: 0, workplaceName: "" });
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                    Ish joyi tanlang *
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-brand-500 dark:peer-focus:text-brand-400 z-10" />
                    <input
                      type="text"
                      value={blockForm.workplaceId ? 
                        merchants.find(w => w.id === blockForm.workplaceId)?.name || ""
                        : blockForm.workplaceName
                      }
                      onChange={(e) => {
                        setBlockForm({ ...blockForm, workplaceName: e.target.value, workplaceId: 0 });
                      }}
                      placeholder="Qidiruv yoki yangi nom yozing..."
                      className="peer w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 py-2.5 text-sm text-navy-700 outline-none focus:border-brand-500 placeholder:text-gray-400 focus:placeholder:text-gray-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400 dark:placeholder:text-gray-500 dark:focus:placeholder:text-gray-400"
                    />
                  </div>
                  
                  {/* Workplace list - tanlangan yoki qidiruv */}
                  {blockForm.workplaceId > 0 ? (
                    // Tanlangan workplace ko'rsatish
                    merchants.length > 0 && (() => {
                      const w = merchants.find(x => x.id === blockForm.workplaceId);
                      return w ? (
                        <div className="rounded-lg border-2 border-brand-500 bg-white dark:border-brand-400 dark:bg-navy-900">
                          <button
                            type="button"
                            onClick={() => {
                              setBlockForm({ ...blockForm, workplaceId: 0, workplaceName: "" });
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium">{w.name}</span>
                                {w.address && <span className="text-xs opacity-75">{w.address}</span>}
                              </div>
                              <span className="text-xs opacity-75">✓ Tanlandi</span>
                            </div>
                          </button>
                        </div>
                      ) : null;
                    })()
                  ) : (
                    // List ko'rsatish
                  merchants.length > 0 && (
                    <div className="rounded-lg border-2 border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-900">
                      <div className="px-4 py-1.5 border-b border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-800">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          📋 Ish joylari ({merchants.filter(w => !blockForm.workplaceName || w.name.toLowerCase().includes(blockForm.workplaceName.toLowerCase())).length} ta)
                        </p>
                      </div>
                      <div className="overflow-y-auto" style={{ maxHeight: '180px' }}>
                        {merchants
                          .filter(w => !blockForm.workplaceName || w.name.toLowerCase().includes(blockForm.workplaceName.toLowerCase()))
                          .map(w => (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => {
                                setBlockForm({ ...blockForm, workplaceId: w.id, workplaceName: w.name });
                              }}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-gray-100 dark:border-navy-700 last:border-b-0 ${
                                blockForm.workplaceId === w.id 
                                  ? 'bg-brand-500 text-white hover:bg-brand-600' 
                                  : 'hover:bg-brand-50 dark:hover:bg-navy-700 text-navy-700 dark:text-white'
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium">{w.name}</span>
                                {w.address && <span className="text-xs opacity-75">{w.address}</span>}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )
                  )}
                  
                  {blockForm.workplaceName.trim() && !blockForm.workplaceId && (
                    <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                      ✨ Yangi ish joyi: "{blockForm.workplaceName}"
                    </p>
                  )}
                </div>
              ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  {activeTab === "merchant" && "Merchant tanlang *"}
                  {activeTab === "fillial" && "Filial tanlang *"}
                  {activeTab === "customer" && "Mijoz tanlang *"}
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-brand-500 dark:peer-focus:text-brand-400 z-10" />
                  <input
                    type="text"
                    value={entitySearch}
                    onChange={(e) => {
                      setEntitySearch(e.target.value);
                      if (e.target.value) {
                        setBlockForm({ ...blockForm, entityId: 0 });
                      }
                    }}
                    placeholder={
                      blockForm.entityId ? 
                        (() => {
                          if (activeTab === "merchant") {
                            const m = merchants.find(x => x.id === blockForm.entityId);
                            return `Tanlangan: ${m?.name || m?.merchant_name || ""}`;
                          } else if (activeTab === "fillial") {
                            const f = fillials.find(x => x.id === blockForm.entityId);
                            return `Tanlangan: ${f?.name || f?.fillial_name || ""}`;
                          } else if (activeTab === "customer") {
                            const u = users.find(x => x.id === blockForm.entityId);
                            return `Tanlangan: ${u?.fullname || u?.full_name || u?.name || ""}`;
                          }
                          return "Qidiruv...";
                        })()
                        : "Qidiruv..."
                    }
                    className="peer w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 py-2.5 text-sm text-navy-700 outline-none focus:border-brand-500 placeholder:text-gray-400 focus:placeholder:text-gray-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white dark:focus:border-brand-400 dark:placeholder:text-gray-500 dark:focus:placeholder:text-gray-400"
                  />
                </div>
                
                {/* List - faqat tanlangan element yoki qidiruv bo'lsa ko'rinadi */}
                {blockForm.entityId > 0 ? (
                  // Tanlangan element ko'rsatish
                  <div className="rounded-lg border-2 border-brand-500 bg-white dark:border-brand-400 dark:bg-navy-900">
                    {activeTab === "merchant" && (() => {
                      const m = merchants.find(x => x.id === blockForm.entityId);
                      return m ? (
                        <button
                          type="button"
                          onClick={() => {
                            setBlockForm({ ...blockForm, entityId: 0 });
                            setEntitySearch("");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium">{m.name || m.merchant_name}</span>
                          <span className="text-xs opacity-75">✓ Tanlandi (o'chirish uchun bosing)</span>
                        </button>
                      ) : null;
                    })()}
                    {activeTab === "fillial" && (() => {
                      const f = fillials.find(x => x.id === blockForm.entityId);
                      return f ? (
                        <button
                          type="button"
                          onClick={() => {
                            setBlockForm({ ...blockForm, entityId: 0 });
                            setEntitySearch("");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{f.name || f.fillial_name}</span>
                              {f.address && <span className="text-xs opacity-75">{f.address}</span>}
                            </div>
                            <span className="text-xs opacity-75">✓ Tanlandi</span>
                          </div>
                        </button>
                      ) : null;
                    })()}
                    {activeTab === "customer" && (() => {
                      const u = users.find(x => x.id === blockForm.entityId);
                      return u ? (
                        <button
                          type="button"
                          onClick={() => {
                            setBlockForm({ ...blockForm, entityId: 0 });
                            setEntitySearch("");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-semibold">{u.fullname || u.full_name || u.name}</div>
                              <div className="flex gap-3 text-xs opacity-85">
                                {u.phone && <span>📞 {u.phone}</span>}
                                {u.passport && <span>🆔 {u.passport}</span>}
                              </div>
                            </div>
                            <span className="text-xs opacity-75">✓ Tanlandi</span>
                          </div>
                        </button>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  // List ko'rsatish (tanlangan bo'lmasa)
                <div className="rounded-lg border-2 border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-900">
                  <div className="px-4 py-1.5 border-b border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-800">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      📋 {activeTab === "merchant" && `Merchantlar (${merchants.filter(m => m.work_status !== "BLOCKED").filter(m => !entitySearch || (m.name || m.merchant_name || "").toLowerCase().includes(entitySearch.toLowerCase())).length} ta)`}
                      {activeTab === "fillial" && `Filliallar (${fillials.filter(f => f.work_status !== "BLOCKED").filter(f => !entitySearch || (f.name || f.fillial_name || "").toLowerCase().includes(entitySearch.toLowerCase())).length} ta)`}
                      {activeTab === "customer" && `Mijozlar (${users.filter(u => u.work_status !== "BLOCKED").filter(u => !entitySearch || (u.fullname || u.full_name || u.name || "").toLowerCase().includes(entitySearch.toLowerCase()) || (u.phone || "").includes(entitySearch)).length} ta)`}
                    </p>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: '180px' }}>
                    {activeTab === "merchant" && merchants
                      .filter(m => m.work_status !== "BLOCKED")
                      .filter(m => !entitySearch || (m.name || m.merchant_name || "").toLowerCase().includes(entitySearch.toLowerCase()))
                      .map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setBlockForm({ ...blockForm, entityId: m.id });
                            setEntitySearch("");
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-gray-100 dark:border-navy-700 last:border-b-0 ${
                            blockForm.entityId === m.id 
                              ? 'bg-brand-500 text-white hover:bg-brand-600' 
                              : 'hover:bg-brand-50 dark:hover:bg-navy-700 text-navy-700 dark:text-white'
                          }`}
                        >
                          <span className="font-medium">{m.name || m.merchant_name}</span>
                        </button>
                      ))
                    }
                    {activeTab === "fillial" && fillials
                      .filter(f => f.work_status !== "BLOCKED")
                      .filter(f => !entitySearch || (f.name || f.fillial_name || "").toLowerCase().includes(entitySearch.toLowerCase()))
                      .map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setBlockForm({ ...blockForm, entityId: f.id });
                            setEntitySearch("");
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-gray-100 dark:border-navy-700 last:border-b-0 ${
                            blockForm.entityId === f.id 
                              ? 'bg-brand-500 text-white hover:bg-brand-600' 
                              : 'hover:bg-brand-50 dark:hover:bg-navy-700 text-navy-700 dark:text-white'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{f.name || f.fillial_name}</span>
                            {f.address && <span className="text-xs opacity-75">{f.address}</span>}
                          </div>
                        </button>
                      ))
                    }
                    {activeTab === "customer" && users
                      .filter(u => u.work_status !== "BLOCKED")
                      .filter(u => !entitySearch || 
                        (u.fullname || u.full_name || u.name || "").toLowerCase().includes(entitySearch.toLowerCase()) ||
                        (u.phone || "").includes(entitySearch)
                      )
                      .map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setBlockForm({ ...blockForm, entityId: u.id });
                            setEntitySearch("");
                          }}
                          className={`w-full px-4 py-2.5 text-left transition-colors border-b border-gray-100 dark:border-navy-700 last:border-b-0 ${
                            blockForm.entityId === u.id 
                              ? 'bg-brand-500 text-white hover:bg-brand-600' 
                              : 'hover:bg-brand-50 dark:hover:bg-navy-700 text-navy-700 dark:text-white'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-semibold text-sm">{u.fullname || u.full_name || u.name || "Noma'lum"}</div>
                            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ opacity: 0.85 }}>
                              {u.phone && (
                                <span className="inline-flex items-center gap-1">
                                  <span>📞</span>
                                  <span>{u.phone}</span>
                                </span>
                              )}
                              {u.passport && (
                                <span className="inline-flex items-center gap-1">
                                  <span>🆔</span>
                                  <span>{u.passport}</span>
                                </span>
                              )}
                              {!u.phone && !u.passport && (
                                <span className="text-gray-400 italic">Ma'lumot yo'q</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    }
                  </div>
                </div>
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
                    setBlockForm({ entityId: 0, reason: "", duration: "", workplaceId: 0, workplaceName: "" });
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
