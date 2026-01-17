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
}

type TabType = "merchant" | "fillial" | "customer" | "workplace";

// Mock Data
const MOCK_MERCHANTS: PermissionItem[] = [
  {
    id: 1,
    name: "Artel Electronics",
    phone: "+998712345678",
    status: "WORKING",
    createdAt: "2023-05-10",
  },
  {
    id: 2,
    name: "Mediapark",
    phone: "+998712345680",
    status: "BLOCKED",
    reason: "Shartnoma shartlari buzildi",
    blockedAt: "2024-11-28",
    blockedUntil: "2025-02-28",
    createdAt: "2023-07-20",
  },
];

const MOCK_FILLIALS: PermissionItem[] = [
  {
    id: 1,
    name: "Chilonzor filiali",
    phone: "+998901111111",
    status: "WORKING",
    createdAt: "2024-01-20",
  },
  {
    id: 2,
    name: "Yunusobod filiali",
    phone: "+998903333333",
    status: "BLOCKED",
    reason: "Litsenziya muddati tugagan",
    blockedAt: "2024-11-30",
    blockedUntil: "2025-05-30",
    createdAt: "2024-03-10",
  },
];

const MOCK_CUSTOMERS: PermissionItem[] = [
  {
    id: 1,
    name: "Aziz Azizov",
    phone: "+998901234567",
    passport: "AA1234567",
    status: "WORKING",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "Dilshod Dilshodov",
    phone: "+998903456789",
    passport: "AC3456789",
    status: "BLOCKED",
    reason: "To'lovlarni o'z vaqtida amalga oshirmagan",
    blockedAt: "2024-11-25",
    blockedUntil: "2025-05-25",
    createdAt: "2024-03-20",
  },
];

const MOCK_WORKPLACES: PermissionItem[] = [
  {
    id: 1,
    name: "Operator #1 - Chilonzor",
    phone: "+998901111111",
    status: "WORKING",
    createdAt: "2024-01-05",
  },
  {
    id: 2,
    name: "Operator #3 - Yunusobod",
    phone: "+998903333333",
    status: "BLOCKED",
    reason: "Ish vaqtida yo'qliklar",
    blockedAt: "2024-11-29",
    blockedUntil: "2024-12-29",
    createdAt: "2024-03-15",
  },
];

const Permissions = () => {
  const [activeTab, setActiveTab] = useState<TabType>("merchant");
  const [search, setSearch] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // Get current data based on active tab
  const getCurrentData = (): PermissionItem[] => {
    switch (activeTab) {
      case "merchant":
        return MOCK_MERCHANTS;
      case "fillial":
        return MOCK_FILLIALS;
      case "customer":
        return MOCK_CUSTOMERS;
      case "workplace":
        return MOCK_WORKPLACES;
      default:
        return [];
    }
  };

  // Filter data - show only blocked items
  const filteredData = useMemo(() => {
    let data = getCurrentData();
    
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
  }, [activeTab, search]);

  const handleUnblock = (id: number) => {
    showToast("Bu funksiya hali ishlamayapti", 'warning');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("uz-UZ");
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
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Ruxsat va Blocklar
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Blocklangan ob'ektlarni ko'rish va boshqarish
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Nomi
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Telefon
                </th>
                {activeTab === "customer" && (
                  <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Passport
                  </th>
                )}
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Sabab
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Block sana
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Tugash sanasi
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-800">
                  <td className="py-4">
                    <p className="font-semibold text-navy-700 dark:text-white">{item.name}</p>
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{item.phone}</td>
                  {activeTab === "customer" && (
                    <td className="py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{item.passport}</td>
                  )}
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{item.reason || "-"}</td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(item.blockedAt)}</td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(item.blockedUntil)}</td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => handleUnblock(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
                    >
                      <LockOpen className="h-4 w-4" />
                      Ochish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-12 text-center">
              <Lock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Blocklangan ob'ektlar topilmadi
              </p>
            </div>
          )}
        </div>
      </Card>

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
