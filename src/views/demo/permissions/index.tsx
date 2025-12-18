import React, { useState, useMemo } from "react";
import Card from "components/card";
import { 
  Lock,
  LockOpen,
  Search,
  Building,
  Home,
  User,
  Clock
} from "tabler-icons-react";
import Toast from "components/toast/ToastNew";

// Mock data types
interface PermissionItem {
  id: number;
  name: string;
  phone?: string;
  passport?: string;
  status: "ACTIVE" | "BLOCKED";
  reason?: string;
  blockedAt?: string;
  blockedUntil?: string;
  createdAt: string;
}

type TabType = "merchant" | "fillial" | "customer" | "workplace";

const MOCK_MERCHANTS: PermissionItem[] = [
  {
    id: 1,
    name: "ARTEL ELECTRONICS",
    phone: "+998901234567",
    status: "ACTIVE",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "UZUM MARKET",
    phone: "+998902345678",
    status: "BLOCKED",
    reason: "Shartnoma buzildi",
    blockedAt: "2024-11-20",
    blockedUntil: "2025-02-20",
    createdAt: "2024-02-10",
  },
  {
    id: 3,
    name: "TEXNOMART",
    phone: "+998903456789",
    status: "ACTIVE",
    createdAt: "2024-03-05",
  },
  {
    id: 4,
    name: "MEDIAPARK",
    phone: "+998904567890",
    status: "BLOCKED",
    reason: "To'lov kechiktirildi",
    blockedAt: "2024-12-01",
    blockedUntil: "2025-12-01",
    createdAt: "2024-04-12",
  },
];

const MOCK_FILLIALS: PermissionItem[] = [
  {
    id: 1,
    name: "Chilonzor filiali",
    phone: "+998901111111",
    status: "ACTIVE",
    createdAt: "2024-01-20",
  },
  {
    id: 2,
    name: "Sergeli filiali",
    phone: "+998902222222",
    status: "ACTIVE",
    createdAt: "2024-02-15",
  },
  {
    id: 3,
    name: "Yunusobod filiali",
    phone: "+998903333333",
    status: "BLOCKED",
    reason: "Litsenziya muddati tugagan",
    blockedAt: "2024-11-30",
    blockedUntil: "2025-05-30",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Yashnobod filiali",
    phone: "+998904444444",
    status: "ACTIVE",
    createdAt: "2024-04-05",
  },
  {
    id: 5,
    name: "Mirobod filiali",
    phone: "+998905555555",
    status: "BLOCKED",
    reason: "Texnik sabablarga ko'ra",
    blockedAt: "2024-12-03",
    blockedUntil: "2024-12-04",
    createdAt: "2024-05-20",
  },
];

const MOCK_CUSTOMERS: PermissionItem[] = [
  {
    id: 1,
    name: "Aliyev Aziz Akmalovich",
    phone: "+998906666666",
    passport: "AA1234567",
    status: "ACTIVE",
    createdAt: "2024-06-10",
  },
  {
    id: 2,
    name: "Karimova Nigora Shavkatovna",
    phone: "+998907777777",
    passport: "AB2345678",
    status: "BLOCKED",
    reason: "To'lovni amalga oshirmadi",
    blockedAt: "2024-11-25",
    blockedUntil: "2025-11-25",
    createdAt: "2024-07-15",
  },
  {
    id: 3,
    name: "Rakhimov Sardor Jamshidovich",
    phone: "+998908888888",
    passport: "AC3456789",
    status: "ACTIVE",
    createdAt: "2024-08-20",
  },
  {
    id: 4,
    name: "Tursunova Dilnoza Bakhtiyorovna",
    phone: "+998909999999",
    passport: "AD4567890",
    status: "BLOCKED",
    reason: "Soxta hujjatlar topildi",
    blockedAt: "2024-12-02",
    blockedUntil: "2027-12-02",
    createdAt: "2024-09-05",
  },
  {
    id: 5,
    name: "Usmanov Javohir Azimovich",
    phone: "+998901010101",
    passport: "AE5678901",
    status: "ACTIVE",
    createdAt: "2024-10-12",
  },
  {
    id: 6,
    name: "Yuldasheva Malika Rustamovna",
    phone: "+998902020202",
    passport: "AF6789012",
    status: "BLOCKED",
    reason: "Kredit bo'yicha qarzdorlik",
    blockedAt: "2024-11-28",
    blockedUntil: "2025-12-28",
    createdAt: "2024-11-01",
  },
];

const MOCK_WORKPLACES: PermissionItem[] = [
  {
    id: 1,
    name: "SAMSUNG ELECTRONICS MCHJ",
    phone: "+998901234561",
    status: "ACTIVE",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "LG ELECTRONICS MCHJ",
    phone: "+998902345672",
    status: "BLOCKED",
    reason: "Ishchilarning ish haqi to'lanmayapti",
    blockedAt: "2024-11-22",
    blockedUntil: "2025-03-22",
    createdAt: "2024-02-05",
  },
  {
    id: 3,
    name: "ARTEL MCHJ",
    phone: "+998903456783",
    status: "ACTIVE",
    createdAt: "2024-03-12",
  },
  {
    id: 4,
    name: "COCA-COLA ICHIMLIKLARI MCHJ",
    phone: "+998904567894",
    status: "BLOCKED",
    reason: "Ishchilar qisqartirish jarayonida",
    blockedAt: "2024-12-01",
    blockedUntil: "2025-06-01",
    createdAt: "2024-04-20",
  },
  {
    id: 5,
    name: "NESTLE UZBEKISTAN MCHJ",
    phone: "+998905678905",
    status: "ACTIVE",
    createdAt: "2024-05-15",
  },
];

const Permissions = () => {
  const [activeTab, setActiveTab] = useState<TabType>("merchant");
  const [search, setSearch] = useState("");
  
  // State for each tab
  const [merchants, setMerchants] = useState<PermissionItem[]>(MOCK_MERCHANTS);
  const [fillials, setFillials] = useState<PermissionItem[]>(MOCK_FILLIALS);
  const [customers, setCustomers] = useState<PermissionItem[]>(MOCK_CUSTOMERS);
  const [workplaces, setWorkplaces] = useState<PermissionItem[]>(MOCK_WORKPLACES);

  // Modal states
  const [showBlockListModal, setShowBlockListModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showEditTimerModal, setShowEditTimerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PermissionItem | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Partial<PermissionItem>>({});
  const [blockReason, setBlockReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [blockDuration, setBlockDuration] = useState<"1d" | "2d" | "3d" | "1w" | "1m" | "2m" | "3m" | "6m" | "1y" | "1.5y" | "2y" | "3y" | "forever">("forever");

  // Toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Get current data based on active tab
  const getCurrentData = (): PermissionItem[] => {
    switch (activeTab) {
      case "merchant":
        return merchants;
      case "fillial":
        return fillials;
      case "customer":
        return customers;
      case "workplace":
        return workplaces;
      default:
        return [];
    }
  };

  // Get setter based on active tab
  const getCurrentSetter = () => {
    switch (activeTab) {
      case "merchant":
        return setMerchants;
      case "fillial":
        return setFillials;
      case "customer":
        return setCustomers;
      case "workplace":
        return setWorkplaces;
      default:
        return setMerchants;
    }
  };

  // Filter data - show only blocked items
  const filteredData = useMemo(() => {
    let data: PermissionItem[] = [];
    
    // Get data based on active tab
    switch (activeTab) {
      case "merchant":
        data = merchants;
        break;
      case "fillial":
        data = fillials;
        break;
      case "customer":
        data = customers;
        break;
      case "workplace":
        data = workplaces;
        break;
    }
    
    // Only show blocked items
    data = data.filter(item => item.status === "BLOCKED");
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.phone?.toLowerCase().includes(searchLower) ||
        item.passport?.toLowerCase().includes(searchLower)
      );
    }
    
    return data;
  }, [activeTab, search, merchants, fillials, customers]);

  // Show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // Get active items to block
  const getActiveItems = (): PermissionItem[] => {
    return getCurrentData().filter(item => item.status === "ACTIVE");
  };

  // Handle add (show block list)
  const handleAdd = () => {
    setSelectedItems([]);
    setShowBlockListModal(true);
  };

  // Handle block selected items
  const handleBlockSelected = () => {
    if (selectedItems.length === 0) {
      showToast("Iltimos bloklash uchun element tanlang!", "error");
      return;
    }
    if (!blockReason.trim()) {
      showToast("Iltimos bloklash sababini kiriting!", "error");
      return;
    }

    const setter = getCurrentSetter();
    const blockedUntil = blockDuration === "forever" ? "Abadiy" : calculateBlockEndDate(blockDuration);
    
    setter((prev: PermissionItem[]) =>
      prev.map(item =>
        selectedItems.includes(item.id)
          ? {
              ...item,
              status: "BLOCKED",
              reason: blockReason,
              blockedAt: new Date().toISOString().split('T')[0],
              blockedUntil: blockedUntil,
            }
          : item
      )
    );

    setShowBlockListModal(false);
    setBlockReason("");
    setSelectedItems([]);
    setBlockDuration("forever");
    showToast(`${selectedItems.length}ta element bloklandi!`, "success");
  };

  // Toggle item selection
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!formData.name || !formData.phone) {
      showToast("Iltimos barcha maydonlarni to'ldiring!", "error");
      return;
    }

    const setter = getCurrentSetter();
    setter((prev: PermissionItem[]) =>
      prev.map(item =>
        item.id === selectedItem?.id
          ? { ...item, ...formData }
          : item
      )
    );

    setShowEditModal(false);
    showToast("Muvaffaqiyatli o'zgartirildi!", "success");
  };

  // Handle toggle block
  const handleToggleBlock = (item: PermissionItem) => {
    setSelectedItem(item);
    if (item.status === "ACTIVE") {
      setBlockReason("");
      setBlockDuration("forever");
      setShowTimerModal(true);
    } else {
      // Unblock directly
      const setter = getCurrentSetter();
      setter((prev: PermissionItem[]) =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: "ACTIVE", reason: undefined, blockedAt: undefined, blockedUntil: undefined }
            : i
        )
      );
      showToast("Bloklash olib tashlandi!", "success");
    }
  };

  // Calculate block end date
  const calculateBlockEndDate = (duration: "1d" | "2d" | "3d" | "1w" | "1m" | "2m" | "3m" | "6m" | "1y" | "1.5y" | "2y" | "3y" | "forever"): string => {
    if (duration === "forever") return "Abadiy";
    const now = new Date();
    switch (duration) {
      case "1d":
        now.setDate(now.getDate() + 1);
        break;
      case "2d":
        now.setDate(now.getDate() + 2);
        break;
      case "3d":
        now.setDate(now.getDate() + 3);
        break;
      case "1w":
        now.setDate(now.getDate() + 7);
        break;
      case "1m":
        now.setMonth(now.getMonth() + 1);
        break;
      case "2m":
        now.setMonth(now.getMonth() + 2);
        break;
      case "3m":
        now.setMonth(now.getMonth() + 3);
        break;
      case "6m":
        now.setMonth(now.getMonth() + 6);
        break;
      case "1y":
        now.setFullYear(now.getFullYear() + 1);
        break;
      case "1.5y":
        now.setMonth(now.getMonth() + 18);
        break;
      case "2y":
        now.setFullYear(now.getFullYear() + 2);
        break;
      case "3y":
        now.setFullYear(now.getFullYear() + 3);
        break;
    }
    return now.toISOString().split('T')[0];
  };

  // Get duration label
  const getDurationLabel = (duration: "1d" | "2d" | "3d" | "1w" | "1m" | "2m" | "3m" | "6m" | "1y" | "1.5y" | "2y" | "3y" | "forever"): string => {
    switch (duration) {
      case "1d":
        return "1 kun";
      case "2d":
        return "2 kun";
      case "3d":
        return "3 kun";
      case "1w":
        return "1 hafta";
      case "1m":
        return "1 oy";
      case "2m":
        return "2 oy";
      case "3m":
        return "3 oy";
      case "6m":
        return "6 oy";
      case "1y":
        return "1 yil";
      case "1.5y":
        return "1.5 yil";
      case "2y":
        return "2 yil";
      case "3y":
        return "3 yil";
      case "forever":
        return "Butunlay";
    }
  };

  // Handle confirm timed block
  const handleConfirmTimedBlock = () => {
    if (!blockReason.trim()) {
      showToast("Iltimos bloklash sababini kiriting!", "error");
      return;
    }

    const setter = getCurrentSetter();
    const blockedUntil = blockDuration === "forever" ? "Abadiy" : calculateBlockEndDate(blockDuration);
    
    setter((prev: PermissionItem[]) =>
      prev.map(item =>
        item.id === selectedItem?.id
          ? {
              ...item,
              status: "BLOCKED",
              reason: blockReason,
              blockedAt: new Date().toISOString().split('T')[0],
              blockedUntil: blockedUntil,
            }
          : item
      )
    );

    setShowTimerModal(false);
    setBlockDuration("forever");
    showToast(`${getDurationLabel(blockDuration)} muddatga bloklandi!`, "success");
  };

  // Handle edit timer
  const handleEditTimer = (item: PermissionItem) => {
    setSelectedItem(item);
    setBlockReason(item.reason || "");
    setBlockDuration("forever");
    setShowEditTimerModal(true);
  };

  // Handle save edited timer
  const handleSaveEditedTimer = () => {
    if (!blockReason.trim()) {
      showToast("Iltimos bloklash sababini kiriting!", "error");
      return;
    }

    const setter = getCurrentSetter();
    const blockedUntil = blockDuration === "forever" ? "Abadiy" : calculateBlockEndDate(blockDuration);
    
    setter((prev: PermissionItem[]) =>
      prev.map(item =>
        item.id === selectedItem?.id
          ? {
              ...item,
              reason: blockReason,
              blockedAt: new Date().toISOString().split('T')[0],
              blockedUntil: blockedUntil,
            }
          : item
      )
    );

    setShowEditTimerModal(false);
    setBlockDuration("forever");
    showToast("Blok muddati o'zgartirildi!", "success");
  };

  // Handle confirm block
  const handleConfirmBlock = () => {
    if (!blockReason.trim()) {
      showToast("Iltimos bloklash sababini kiriting!", "error");
      return;
    }

    const setter = getCurrentSetter();
    setter((prev: PermissionItem[]) =>
      prev.map(item =>
        item.id === selectedItem?.id
          ? {
              ...item,
              status: "BLOCKED",
              reason: blockReason,
              blockedAt: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );

    setShowBlockModal(false);
    showToast("Muvaffaqiyatli bloklandi!", "success");
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case "merchant":
        return <Building size={18} />;
      case "fillial":
        return <Home size={18} />;
      case "customer":
        return <User size={18} />;
      case "workplace":
        return <Building size={18} />;
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "merchant":
        return "Merchantlar";
      case "fillial":
        return "Filiallar";
      case "customer":
        return "Mijozlar";
      case "workplace":
        return "Ish joylari";
    }
  };

  return (
    <div className="mt-3">
      <Card extra="w-full h-full p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-2">
            Ruxsat va Blocklar
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Merchantlar, filiallar, mijozlar va ish joylarini boshqarish va bloklash
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {(["merchant", "fillial", "customer", "workplace"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                activeTab === tab
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {getTabIcon(tab)}
              <span>{getTabLabel(tab)}</span>
              <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab
                  ? "bg-brand-500/10 text-brand-500"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {getCurrentData().length}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish (ism, telefon, passport)..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
            />
          </div>

          {/* Block Button */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
          >
            <Lock size={18} />
            Bloklash
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nomi
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Telefon
                </th>
                {activeTab === "customer" && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Passport
                  </th>
                )}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Holat
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Yaratilgan
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "customer" ? 7 : 6}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-navy-800"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-navy-700 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {item.phone || "-"}
                    </td>
                    {activeTab === "customer" && (
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {item.passport || "-"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {item.status === "ACTIVE" ? (
                            <LockOpen size={12} />
                          ) : (
                            <Lock size={12} />
                          )}
                          {item.status === "ACTIVE" ? "Faol" : "Bloklangan"}
                        </span>
                        {item.status === "BLOCKED" && (
                          <>
                            {item.reason && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Sabab: {item.reason}
                              </span>
                            )}
                            {item.blockedUntil && (
                              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                Tugaydi: {item.blockedUntil}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {item.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === "BLOCKED" && (
                          <button
                            onClick={() => handleEditTimer(item)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            title="Vaqtni o'zgartirish"
                          >
                            <Clock size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleBlock(item)}
                          className={`rounded-lg p-2 transition-all ${
                            item.status === "ACTIVE"
                              ? "bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                              : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          }`}
                          title={item.status === "ACTIVE" ? "Vaqtli bloklash" : "Blokdan chiqarish"}
                        >
                          {item.status === "ACTIVE" ? (
                            <Lock size={16} />
                          ) : (
                            <LockOpen size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Block List Modal */}
      {showBlockListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-navy-800 max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {getTabLabel(activeTab)} bloklash
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Bloklash uchun faol elementlarni tanlang:
            </p>

            {/* Active Items List */}
            <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {getActiveItems().length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Faol {getTabLabel(activeTab)} topilmadi
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getActiveItems().map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-navy-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-navy-700 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.phone}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Block Reason */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloklash sababi *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                placeholder="Bloklash sababini kiriting..."
              />
            </div>

            {/* Duration Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloklash muddati *
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setBlockDuration("forever")}
                  className={`col-span-4 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    blockDuration === "forever"
                      ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  Butunlay bloklash
                </button>
                <button
                  onClick={() => setBlockDuration("1d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 kun
                </button>
                <button
                  onClick={() => setBlockDuration("2d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 kun
                </button>
                <button
                  onClick={() => setBlockDuration("3d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 kun
                </button>
                <button
                  onClick={() => setBlockDuration("1w")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1w"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 hafta
                </button>
                <button
                  onClick={() => setBlockDuration("1m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 oy
                </button>
                <button
                  onClick={() => setBlockDuration("2m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 oy
                </button>
                <button
                  onClick={() => setBlockDuration("3m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 oy
                </button>
                <button
                  onClick={() => setBlockDuration("6m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "6m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  6 oy
                </button>
                <button
                  onClick={() => setBlockDuration("1y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 yil
                </button>
                <button
                  onClick={() => setBlockDuration("1.5y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1.5y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1.5 yil
                </button>
                <button
                  onClick={() => setBlockDuration("2y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 yil
                </button>
                <button
                  onClick={() => setBlockDuration("3y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 yil
                </button>
              </div>
            </div>

            {/* Info */}
            {blockDuration !== "forever" && (
              <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-400">
                <strong>Blok tugash sanasi:</strong> {calculateBlockEndDate(blockDuration)}
              </div>
            )}

            {/* Selected Count */}
            {selectedItems.length > 0 && (
              <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-400">
                {selectedItems.length}ta element tanlandi
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockListModal(false);
                  setSelectedItems([]);
                  setBlockReason("");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleBlockSelected}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
              >
                Bloklash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-800">
            <h2 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {getTabLabel(activeTab)} tahrirlash
            </h2>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nomi *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefon *
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
              />
            </div>
            {activeTab === "customer" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Passport
                </label>
                <input
                  type="text"
                  value={formData.passport || ""}
                  onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  placeholder="AA1234567"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Block Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-800">
            <h2 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Vaqtli bloklash
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              "{selectedItem?.name}" ni vaqtincha bloklash
            </p>

            {/* Duration Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloklash muddati *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {/* Forever - Full Width */}
                <button
                  onClick={() => setBlockDuration("forever")}
                  className={`col-span-4 rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "forever"
                      ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  Butunlay bloklash
                </button>
                
                {/* Time-based Options */}
                <button
                  onClick={() => setBlockDuration("1d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 kun
                </button>
                <button
                  onClick={() => setBlockDuration("2d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 kun
                </button>
                <button
                  onClick={() => setBlockDuration("3d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 kun
                </button>
                <button
                  onClick={() => setBlockDuration("1w")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1w"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 hafta
                </button>
                <button
                  onClick={() => setBlockDuration("1m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 oy
                </button>
                <button
                  onClick={() => setBlockDuration("2m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 oy
                </button>
                <button
                  onClick={() => setBlockDuration("3m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 oy
                </button>
                <button
                  onClick={() => setBlockDuration("6m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "6m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  6 oy
                </button>
                <button
                  onClick={() => setBlockDuration("1y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 yil
                </button>
                <button
                  onClick={() => setBlockDuration("1.5y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1.5y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1.5 yil
                </button>
                <button
                  onClick={() => setBlockDuration("2y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 yil
                </button>
                <button
                  onClick={() => setBlockDuration("3y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 yil
                </button>
              </div>
            </div>

            {/* Block Reason */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloklash sababi *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                placeholder="Bloklash sababini kiriting..."
              />
            </div>

            {/* Info */}
            {blockDuration !== "forever" && (
              <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-400">
                <strong>Blok tugash sanasi:</strong> {calculateBlockEndDate(blockDuration)}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTimerModal(false);
                  setBlockReason("");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmTimedBlock}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
              >
                Bloklash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Timer Modal */}
      {showEditTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-800">
            <h2 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Blok muddatini o'zgartirish
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              "{selectedItem?.name}" uchun yangi vaqt va sabab kiriting
            </p>

            {/* Block Reason */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloklash sababi *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                placeholder="Bloklash sababini kiriting..."
              />
            </div>

            {/* Duration Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bloklash muddati *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {/* Forever - Full Width */}
                <button
                  onClick={() => setBlockDuration("forever")}
                  className={`col-span-4 rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "forever"
                      ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  Butunlay bloklash
                </button>
                
                {/* Time-based Options */}
                <button
                  onClick={() => setBlockDuration("1d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 kun
                </button>
                <button
                  onClick={() => setBlockDuration("2d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 kun
                </button>
                <button
                  onClick={() => setBlockDuration("3d")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3d"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 kun
                </button>
                <button
                  onClick={() => setBlockDuration("1w")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1w"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 hafta
                </button>
                <button
                  onClick={() => setBlockDuration("1m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 oy
                </button>
                <button
                  onClick={() => setBlockDuration("2m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 oy
                </button>
                <button
                  onClick={() => setBlockDuration("3m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 oy
                </button>
                <button
                  onClick={() => setBlockDuration("6m")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "6m"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  6 oy
                </button>
                <button
                  onClick={() => setBlockDuration("1y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1 yil
                </button>
                <button
                  onClick={() => setBlockDuration("1.5y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "1.5y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  1.5 yil
                </button>
                <button
                  onClick={() => setBlockDuration("2y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "2y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  2 yil
                </button>
                <button
                  onClick={() => setBlockDuration("3y")}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    blockDuration === "3y"
                      ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-300"
                  }`}
                >
                  3 yil
                </button>
              </div>
            </div>

            {/* Info */}
            {blockDuration !== "forever" && (
              <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-400">
                <strong>Yangi tugash sanasi:</strong> {calculateBlockEndDate(blockDuration)}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditTimerModal(false);
                  setBlockReason("");
                  setBlockDuration("1d");
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveEditedTimer}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-800">
            <h2 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Bloklash
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              "{selectedItem?.name}" ni bloklash sababini kiriting:
            </p>
            <div className="mb-4">
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                placeholder="Bloklash sababini kiriting..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmBlock}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
              >
                Bloklash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
};

export default Permissions;
