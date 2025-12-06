import { useState, useMemo } from "react";
import { User, FileText, BuildingStore, Search, Home, LayoutDashboard } from "tabler-icons-react";
import Card from "components/card";
import CustomSelect from "components/dropdown/CustomSelect";
import DebtsDashboard from "./components/DebtsDashboard";

// Types
type CustomerDebt = {
  id: number;
  customerName: string;
  phone: string;
  passport: string;
  birthDate: string;
  region: string;
  applicationCount: number;
  totalApplicationsDebt: number;
  monthlyDebt: number;
  monthlyPaymentDeadline: string; // Oylik to'lov sanasi
  totalDebt: number;
  remainingMonths: number; // Qolgan oylar
  lastPaymentDate?: string;
  debtSince: string;
  applications: {
    id: string;
    merchantName: string;
    fillialName: string;
    region: string;
    products: { name: string; price: number; count: number; barcode: string }[];
    totalDebt: number;
    remainingMonths: number;
    contractMonths: number;
    isPaid: boolean;
  }[];
};

type ApplicationDebt = {
  id: number;
  applicationId: string;
  customerName: string;
  phone: string;
  products: { name: string; price: number; count: number; barcode: string }[];
  merchantName: string;
  fillialName: string;
  region: string;
  monthlyDebt: number;
  monthlyPaymentDeadline: string;
  totalDebt: number;
  remainingMonths: number;
  contractMonths: number;
  lastPaymentDate?: string;
};

type MerchantDebt = {
  id: number;
  merchantName: string;
  fillialCount: number;
  region: string;
  debtApplicationsCount: number;
  debtCustomersCount: number;
  monthlyDebt: number;
  monthlyPaymentDeadline: string;
  totalDebt: number;
  remainingMonths: number;
  lastPaymentDate?: string;
  debtSince: string;
};

type FillialDebt = {
  id: number;
  fillialName: string;
  merchantName: string;
  region: string;
  address: string;
  monthlyDebt: number;
  monthlyPaymentDeadline: string;
  totalDebt: number;
  remainingMonths: number;
  lastPaymentDate?: string;
  debtSince: string;
};

// Mock Data - Customers
const MOCK_CUSTOMERS: CustomerDebt[] = [
  {
    id: 1,
    customerName: "Akmal Rahimov",
    phone: "+998 90 123 45 67",
    passport: "AA1234567",
    birthDate: "1990-05-15",
    region: "Toshkent",
    applicationCount: 3,
    totalApplicationsDebt: 2500000,
    monthlyDebt: 500000,
    monthlyPaymentDeadline: "2024-12-15",
    totalDebt: 2500000,
    remainingMonths: 5,
    lastPaymentDate: "2024-11-15",
    debtSince: "2024-06-01",
    applications: [
      {
        id: "#10234",
        merchantName: "Texnomart",
        fillialName: "Chilonzor filiali",
        region: "Toshkent",
        products: [
          { name: "Samsung Galaxy S23", price: 8000000, count: 1, barcode: "88060976" },
          { name: "Samsung Buds", price: 1200000, count: 1, barcode: "88061234" }
        ],
        totalDebt: 1500000,
        remainingMonths: 3,
        contractMonths: 12,
        isPaid: false
      },
      {
        id: "#10189",
        merchantName: "Artel Plaza",
        fillialName: "Sergeli filiali",
        region: "Toshkent",
        products: [
          { name: "Apple Watch Series 9", price: 5000000, count: 1, barcode: "88062456" }
        ],
        totalDebt: 0,
        remainingMonths: 0,
        contractMonths: 6,
        isPaid: true
      },
      {
        id: "#10145",
        merchantName: "Mediapark",
        fillialName: "Yunusobod filiali",
        region: "Toshkent",
        products: [
          { name: "iPad Air", price: 7500000, count: 1, barcode: "88063789" },
          { name: "Apple Pencil", price: 1500000, count: 1, barcode: "88064012" }
        ],
        totalDebt: 1000000,
        remainingMonths: 2,
        contractMonths: 6,
        isPaid: false
      }
    ]
  },
  {
    id: 2,
    customerName: "Dilshod Karimov",
    phone: "+998 91 234 56 78",
    passport: "AB2345678",
    birthDate: "1985-08-22",
    region: "Samarqand",
    applicationCount: 3,
    totalApplicationsDebt: 3750000,
    monthlyDebt: 750000,
    monthlyPaymentDeadline: "2024-12-10",
    totalDebt: 3750000,
    remainingMonths: 5,
    lastPaymentDate: "2024-10-28",
    debtSince: "2024-05-15",
    applications: [
      {
        id: "#10298",
        merchantName: "Artel Plaza",
        fillialName: "Samarqand filiali",
        region: "Samarqand",
        products: [
          { name: "iPhone 15 Pro Max", price: 18000000, count: 1, barcode: "88065345" },
          { name: "AirPods Pro", price: 2500000, count: 1, barcode: "88066678" }
        ],
        totalDebt: 2500000,
        remainingMonths: 5,
        contractMonths: 12,
        isPaid: false
      },
      {
        id: "#10267",
        merchantName: "Mediapark",
        fillialName: "Registon filiali",
        region: "Samarqand",
        products: [
          { name: "MacBook Air M2", price: 15000000, count: 1, barcode: "88067901" }
        ],
        totalDebt: 1250000,
        remainingMonths: 3,
        contractMonths: 12,
        isPaid: false
      },
      {
        id: "#10201",
        merchantName: "Texnomart",
        fillialName: "Markaz filiali",
        region: "Samarqand",
        products: [
          { name: "Artel TV 55\"", price: 6000000, count: 1, barcode: "88068234" },
          { name: "Soundbar", price: 1500000, count: 1, barcode: "88069567" }
        ],
        totalDebt: 0,
        remainingMonths: 0,
        contractMonths: 6,
        isPaid: true
      }
    ]
  },
  {
    id: 3,
    customerName: "Shohruh Tursunov",
    phone: "+998 93 345 67 89",
    passport: "AC3456789",
    birthDate: "1992-11-30",
    region: "Andijon",
    applicationCount: 3,
    totalApplicationsDebt: 1200000,
    monthlyDebt: 300000,
    monthlyPaymentDeadline: "2024-12-20",
    totalDebt: 1200000,
    remainingMonths: 4,
    lastPaymentDate: "2024-11-20",
    debtSince: "2024-08-10",
    applications: [
      {
        id: "#10312",
        merchantName: "Artel Plaza",
        fillialName: "Andijon filiali",
        region: "Andijon",
        products: [
          { name: "LG Muzlatgich", price: 8500000, count: 1, barcode: "88070890" }
        ],
        totalDebt: 850000,
        remainingMonths: 3,
        contractMonths: 12,
        isPaid: false
      },
      {
        id: "#10289",
        merchantName: "Texnomart",
        fillialName: "Markaz filiali",
        region: "Andijon",
        products: [
          { name: "Samsung Kir yuvish", price: 4500000, count: 1, barcode: "88071123" },
          { name: "Dazmol", price: 450000, count: 1, barcode: "88072456" }
        ],
        totalDebt: 350000,
        remainingMonths: 1,
        contractMonths: 6,
        isPaid: false
      },
      {
        id: "#10245",
        merchantName: "Mediapark",
        fillialName: "Asaka filiali",
        region: "Andijon",
        products: [
          { name: "Artel Konditsioner", price: 3500000, count: 1, barcode: "88073789" }
        ],
        totalDebt: 0,
        remainingMonths: 0,
        contractMonths: 6,
        isPaid: true
      }
    ]
  },
];

// Mock Data - Applications
const MOCK_APPLICATIONS: ApplicationDebt[] = [
  {
    id: 101,
    applicationId: "#10234",
    customerName: "Akmal Rahimov",
    phone: "+998 90 123 45 67",
    products: [
      { name: "Samsung Galaxy S23", price: 12500000, count: 1, barcode: "88074012" },
      { name: "Samsung Buds", price: 1500000, count: 1, barcode: "88075345" },
      { name: "Telefon qopqog'i", price: 150000, count: 2, barcode: "88076678" },
      { name: "Ekran himoyasi", price: 100000, count: 1, barcode: "88077901" }
    ],
    merchantName: "Texnomart",
    fillialName: "Chilonzor filiali",
    region: "Toshkent",
    monthlyDebt: 850000,
    monthlyPaymentDeadline: "2024-12-10",
    totalDebt: 4250000,
    remainingMonths: 5,
    contractMonths: 12,
    lastPaymentDate: "2024-11-10",
  },
  {
    id: 102,
    applicationId: "#10198",
    customerName: "Dilshod Karimov",
    phone: "+998 91 234 56 78",
    products: [
      { name: "iPhone 15 Pro", price: 15000000, count: 1, barcode: "88078234" },
      { name: "AirPods Pro", price: 2500000, count: 1, barcode: "88079567" },
      { name: "iPhone qopqog'i", price: 250000, count: 1, barcode: "88080890" },
      { name: "Zaryadlovchi", price: 350000, count: 1, barcode: "88081123" }
    ],
    merchantName: "Artel Plaza",
    fillialName: "Sergeli filiali",
    region: "Toshkent",
    monthlyDebt: 600000,
    monthlyPaymentDeadline: "2024-12-18",
    totalDebt: 3000000,
    remainingMonths: 5,
    contractMonths: 6,
    lastPaymentDate: "2024-11-18",
  },
  {
    id: 103,
    applicationId: "#10156",
    customerName: "Shohruh Tursunov",
    phone: "+998 93 345 67 89",
    products: [
      { name: "LG Muzlatgich", price: 8500000, count: 1, barcode: "88082456" },
      { name: "Samsung Kir yuvish mashinasi", price: 4500000, count: 1, barcode: "88083789" },
      { name: "Dazmol", price: 450000, count: 1, barcode: "88084012" },
      { name: "Uy uchun aksessuarlar", price: 350000, count: 1, barcode: "88085345" }
    ],
    merchantName: "Artel Plaza",
    fillialName: "Yunusobod filiali",
    region: "Samarqand",
    monthlyDebt: 400000,
    monthlyPaymentDeadline: "2024-12-30",
    totalDebt: 2400000,
    remainingMonths: 6,
    contractMonths: 12,
    lastPaymentDate: "2024-10-30",
  },
];

// Mock Data - Merchants
const MOCK_MERCHANTS: MerchantDebt[] = [
  {
    id: 201,
    merchantName: "Texnomart",
    fillialCount: 15,
    region: "Toshkent",
    debtApplicationsCount: 23,
    debtCustomersCount: 18,
    monthlyDebt: 15000000,
    monthlyPaymentDeadline: "2024-12-25",
    totalDebt: 75000000,
    remainingMonths: 5,
    lastPaymentDate: "2024-11-25",
    debtSince: "2024-06-01",
  },
  {
    id: 202,
    merchantName: "Artel Plaza",
    fillialCount: 22,
    region: "Samarqand",
    debtApplicationsCount: 31,
    debtCustomersCount: 25,
    monthlyDebt: 22000000,
    monthlyPaymentDeadline: "2024-12-20",
    totalDebt: 132000000,
    remainingMonths: 6,
    lastPaymentDate: "2024-11-20",
    debtSince: "2024-05-15",
  },
];

// Mock Data - Fillials
const MOCK_FILLIALS: FillialDebt[] = [
  {
    id: 301,
    fillialName: "Chilonzor filiali",
    merchantName: "Texnomart",
    region: "Toshkent",
    address: "Chilonzor ko'chasi, 12",
    monthlyDebt: 3500000,
    monthlyPaymentDeadline: "2024-12-25",
    totalDebt: 17500000,
    remainingMonths: 5,
    lastPaymentDate: "2024-11-25",
    debtSince: "2024-06-01",
  },
  {
    id: 302,
    fillialName: "Sergeli filiali",
    merchantName: "Artel Plaza",
    region: "Samarqand",
    address: "Sergeli 5-mavze",
    monthlyDebt: 5200000,
    monthlyPaymentDeadline: "2024-12-20",
    totalDebt: 31200000,
    remainingMonths: 6,
    lastPaymentDate: "2024-11-20",
    debtSince: "2024-05-15",
  },
];

// Format number to currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
};

// Format date to DD.MM.YYYY
const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

// Tab type definition
type TabType = "dashboard" | "customers" | "applications" | "merchants" | "fillials";

export default function Debts() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CustomerDebt | ApplicationDebt | MerchantDebt | FillialDebt | null>(null);

  // Get unique regions
  const regions = useMemo(() => {
    const allData = [...MOCK_MERCHANTS, ...MOCK_FILLIALS, ...MOCK_APPLICATIONS];
    const uniqueRegions = new Set<string>();
    allData.forEach(item => {
      if ('region' in item && item.region) {
        uniqueRegions.add(item.region);
      }
    });
    return Array.from(uniqueRegions).sort();
  }, []);

  // Get current data based on active tab
  const getCurrentData = (): (CustomerDebt | ApplicationDebt | MerchantDebt | FillialDebt)[] => {
    switch (activeTab) {
      case "dashboard":
        return [];
      case "customers":
        return MOCK_CUSTOMERS;
      case "applications":
        return MOCK_APPLICATIONS;
      case "merchants":
        return MOCK_MERCHANTS;
      case "fillials":
        return MOCK_FILLIALS;
      default:
        return [];
    }
  };

  // Filter data based on search and region
  const filteredData = useMemo(() => {
    let data = getCurrentData();
    
    // Region filter
    if (selectedRegion !== "all") {
      data = data.filter((item) => {
        if ('region' in item) {
          return item.region === selectedRegion;
        }
        return true;
      });
    }
    
    // Search filter
    if (!searchQuery.trim()) return data;

    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      if (activeTab === "customers") {
        const customer = item as CustomerDebt;
        return customer.customerName.toLowerCase().includes(searchLower) ||
               customer.phone.toLowerCase().includes(searchLower);
      } else if (activeTab === "applications") {
        const app = item as ApplicationDebt;
        return app.applicationId.toLowerCase().includes(searchLower) ||
               app.customerName.toLowerCase().includes(searchLower) ||
               app.products.some(p => p.name.toLowerCase().includes(searchLower));
      } else if (activeTab === "merchants") {
        const merchant = item as MerchantDebt;
        return merchant.merchantName.toLowerCase().includes(searchLower) ||
               merchant.region.toLowerCase().includes(searchLower);
      } else if (activeTab === "fillials") {
        const fillial = item as FillialDebt;
        return fillial.fillialName.toLowerCase().includes(searchLower) ||
               fillial.merchantName.toLowerCase().includes(searchLower) ||
               fillial.region.toLowerCase().includes(searchLower);
      }
      return false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery, selectedRegion]);

  // Calculate totals
  const totals = useMemo(() => {
    const data = filteredData;
    return {
      monthlyDebt: data.reduce((sum, item) => sum + item.monthlyDebt, 0),
      totalDebt: data.reduce((sum, item) => sum + item.totalDebt, 0),
      count: data.length,
    };
  }, [filteredData]);

  // Get tab label
  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case "customers":
        return "Mijozlar";
      case "applications":
        return "Arizalar";
      case "merchants":
        return "Merchantlar";
      case "fillials":
        return "Filiallar";
      default:
        return "";
    }
  };

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          Qarzdorlik
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Mijozlar, arizalar va merchantlarning qarzdorliklari
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card extra="!p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Bu oygi qarzdorlik
              </p>
              <h3 className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
                {formatCurrency(totals.monthlyDebt)}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <FileText size={28} className="text-orange-500" />
            </div>
          </div>
        </Card>

        <Card extra="!p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Umumiy qarzdorlik
              </p>
              <h3 className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
                {formatCurrency(totals.totalDebt)}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <FileText size={28} className="text-red-500" />
            </div>
          </div>
        </Card>

        <Card extra="!p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Qarzdorlar soni
              </p>
              <h3 className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">
                {totals.count}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <User size={28} className="text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Card */}
      <Card extra="!p-5">
        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "customers"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <User size={18} />
            Mijozlar
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "applications"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FileText size={18} />
            Arizalar
          </button>
          <button
            onClick={() => setActiveTab("merchants")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "merchants"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <BuildingStore size={18} />
            Merchantlar
          </button>
          <button
            onClick={() => setActiveTab("fillials")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "fillials"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Home size={18} />
            Filiallar
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={`${getTabLabel(activeTab)} bo'yicha qidirish...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
            />
          </div>
          
          {activeTab === "fillials" && (
            <CustomSelect
              value={selectedRegion}
              onChange={setSelectedRegion}
              options={[
                { value: "all", label: "Barcha hududlar" },
                ...regions.map((region) => ({
                  value: region,
                  label: region
                }))
              ]}
              className="flex-1 min-w-[160px] sm:flex-initial sm:w-auto"
            />
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === "dashboard" ? (
          <DebtsDashboard />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  #
                </th>
                {activeTab === "customers" && (
                  <>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Mijoz
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Passport
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Tug'ilgan sana
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Hudud
                    </th>
                  </>
                )}
                {activeTab === "applications" && (
                  <>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Ariza ID
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Mijoz
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Mahsulot
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 pl-8">
                      Summa
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 pl-8">
                      Filial
                    </th>
                    <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Qolgan oy
                    </th>
                  </>
                )}
                {activeTab === "merchants" && (
                  <>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Merchant
                    </th>
                    <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Qarzdor arizalar
                    </th>
                    <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Qarzdor mijozlar
                    </th>
                  </>
                )}
                {activeTab === "fillials" && (
                  <>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Filial
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Merchant
                    </th>
                    <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Hudud
                    </th>
                  </>
                )}
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Umumiy qarzdorlik
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Batafsil
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "customers" ? 6 : activeTab === "applications" ? 8 : activeTab === "fillials" ? 6 : 6}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  if (activeTab === "customers") {
                    const customer = item as CustomerDebt;
                    const unpaidApplications = customer.applications.filter(app => !app.isPaid).length;
                    
                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => {
                          setSelectedItem(customer);
                          setShowDetailModal(true);
                        }}
                      >
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-4 text-sm font-medium text-navy-700 dark:text-white">
                          <div>{customer.customerName}</div>
                          <div className="text-xs text-gray-500">{customer.phone}</div>
                          {unpaidApplications > 0 && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 dark:bg-red-900/30">
                              <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="text-xs font-medium text-red-700 dark:text-red-400">{unpaidApplications} ta qarzdor</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-sm font-mono font-semibold text-navy-700 dark:text-white">
                          {customer.passport}
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(customer.birthDate)}
                        </td>
                        <td className="py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {customer.region}
                        </td>
                        <td className="py-4 text-right text-sm font-semibold text-navy-700 dark:text-white">
                          {formatCurrency(customer.totalDebt)}
                        </td>
                        <td className="py-4 text-center">
                          <button className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600">
                            Ko'rish
                          </button>
                        </td>
                      </tr>
                    );
                  } else if (activeTab === "applications") {
                    const app = item as ApplicationDebt;
                    
                    return (
                      <tr
                        key={app.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => {
                          setSelectedItem(app);
                          setShowDetailModal(true);
                        }}
                      >
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-4 text-sm font-bold text-brand-500">
                          {app.applicationId}
                        </td>
                        <td className="py-4 text-sm font-medium text-navy-700 dark:text-white">
                          {app.customerName}
                          <div className="text-xs text-gray-500">{app.phone}</div>
                        </td>
                        <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="font-medium">{app.products[0]?.name}</div>
                          {app.products.length > 1 && (
                            <div className="text-xs text-gray-500">+{app.products.length - 1} ta mahsulot</div>
                          )}
                        </td>
                        <td className="py-4 text-left text-sm font-semibold text-green-600 dark:text-green-400 pl-8">
                          {formatCurrency(app.products.reduce((sum, p) => sum + (p.price * p.count), 0))}
                        </td>
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400 pl-8">
                          <div>{app.merchantName}</div>
                          <div className="text-xs text-gray-500">{app.fillialName}</div>
                        </td>
                        <td className="py-4 text-center text-sm">
                          <div className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 dark:bg-indigo-900/30">
                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                              {app.remainingMonths}
                            </span>
                            <span className="text-xs text-indigo-600 dark:text-indigo-500">/</span>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-500">
                              {app.contractMonths}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(app.totalDebt)}
                        </td>
                        <td className="py-4 text-center">
                          <button className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600">
                            Ko'rish
                          </button>
                        </td>
                      </tr>
                    );
                  } else if (activeTab === "merchants") {
                    const merchant = item as MerchantDebt;
                    
                    return (
                      <tr
                        key={merchant.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => {
                          setSelectedItem(merchant);
                          setShowDetailModal(true);
                        }}
                      >
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-4 text-sm font-medium text-navy-700 dark:text-white">
                          <div>{merchant.merchantName}</div>
                          <div className="mt-1 text-xs text-indigo-600">{merchant.fillialCount} ta filial</div>
                        </td>
                        <td className="py-4 text-center text-sm">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 dark:bg-red-900/30">
                            <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-bold text-red-700 dark:text-red-400">{merchant.debtApplicationsCount}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center text-sm">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-900/30">
                            <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{merchant.debtCustomersCount}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(merchant.totalDebt)}
                        </td>
                        <td className="py-4 text-center">
                          <button className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600">
                            Ko'rish
                          </button>
                        </td>
                      </tr>
                    );
                  } else if (activeTab === "fillials") {
                    const fillial = item as FillialDebt;
                    
                    return (
                      <tr
                        key={fillial.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => {
                          setSelectedItem(fillial);
                          setShowDetailModal(true);
                        }}
                      >
                        <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-4 text-sm font-medium text-navy-700 dark:text-white">
                          <div>{fillial.fillialName}</div>
                          <div className="mt-1 text-xs text-gray-500">{fillial.address}</div>
                        </td>
                        <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                          {fillial.merchantName}
                        </td>
                        <td className="py-4 text-sm text-indigo-600 dark:text-indigo-400">
                          {fillial.region}
                        </td>
                        <td className="py-4 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(fillial.totalDebt)}
                        </td>
                        <td className="py-4 text-center">
                          <button className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600">
                            Ko'rish
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {filteredData.length > 0 && (
          <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Jami: <strong>{totals.count}</strong> ta qarzdor
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Bu oygi jami:{" "}
                  </span>
                  <strong className="text-orange-600 dark:text-orange-400">
                    {formatCurrency(totals.monthlyDebt)}
                  </strong>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Umumiy jami:{" "}
                  </span>
                  <strong className="text-red-600 dark:text-red-400">
                    {formatCurrency(totals.totalDebt)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                Batafsil ma'lumot
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === "customers" && 'customerName' in selectedItem && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mijoz</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefon</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hudud</p>
                      <p className="mt-1 text-base font-semibold text-indigo-600">{(selectedItem as CustomerDebt).region}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passport</p>
                      <p className="mt-1 text-base font-mono font-semibold text-navy-700 dark:text-white">{(selectedItem as CustomerDebt).passport}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tug'ilgan sana</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{formatDate((selectedItem as CustomerDebt).birthDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arizalar soni</p>
                    <p className="mt-1 text-base font-semibold text-indigo-600">{(selectedItem as CustomerDebt).applicationCount} ta</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bu oygi qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-orange-600">{formatCurrency(selectedItem.monthlyDebt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Umumiy qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-red-600">{formatCurrency(selectedItem.totalDebt)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Keyingi to'lov sanasi</p>
                      <p className="mt-1 text-base font-semibold text-orange-600">{formatDate(selectedItem.monthlyPaymentDeadline)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Oxirgi to'lov</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">
                        {selectedItem.lastPaymentDate ? formatDate(selectedItem.lastPaymentDate) : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sana</p>
                    <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{formatDate((selectedItem as CustomerDebt).debtSince)}</p>
                  </div>

                  {/* Applications List */}
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">Arizalar ro'yxati</p>
                    <div className="space-y-3">
                      {(selectedItem as CustomerDebt).applications.map((app, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border p-4 ${
                            app.isPaid
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-500">{app.id}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400">{app.merchantName} - {app.fillialName}</span>
                              {app.isPaid && (
                                <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 dark:bg-green-900/30">
                                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Yopilgan</span>
                                </div>
                              )}
                              {!app.isPaid && (
                                <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 dark:bg-red-900/30">
                                  <span className="text-xs font-medium text-red-700 dark:text-red-400">
                                    {app.remainingMonths}/{app.contractMonths} oy qolgan
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className={`text-sm font-bold ${
                              app.isPaid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {app.isPaid ? 'To\'landi' : formatCurrency(app.totalDebt)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {app.products.map((product, pIdx) => (
                              <div key={pIdx} className="space-y-0.5 border-b border-gray-200 pb-1 last:border-0 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {product.name} <span className="text-xs text-gray-500">× {product.count}</span>
                                  </span>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">
                                    {formatCurrency(product.price * product.count)}
                                  </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded bg-indigo-50 px-2 py-0.5 dark:bg-indigo-900/20">
                                  <svg className="h-3 w-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-400">{product.barcode}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "applications" && 'applicationId' in selectedItem && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ariza ID</p>
                      <p className="mt-1 text-base font-semibold text-brand-500">{selectedItem.applicationId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hudud</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.region}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mijoz</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefon</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Merchant</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.merchantName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filial</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.fillialName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Mahsulotlar</p>
                    <div className="grid gap-3">
                      {selectedItem.products.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-navy-800">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
                              <span className="text-lg font-bold text-brand-500">{idx + 1}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-navy-700 dark:text-white">{product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{product.count} dona × {formatCurrency(product.price)}</p>
                              <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-1 dark:from-indigo-900/30 dark:to-purple-900/30">
                                <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">{product.barcode}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(product.price * product.count)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Jami</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-brand-500/5 p-3 dark:bg-brand-500/10">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-navy-700 dark:text-white">Umumiy summa:</span>
                        <span className="text-lg font-bold text-brand-500">
                          {formatCurrency(selectedItem.products.reduce((sum, p) => sum + (p.price * p.count), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bu oygi qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-orange-600">{formatCurrency(selectedItem.monthlyDebt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Umumiy qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-red-600">{formatCurrency(selectedItem.totalDebt)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Qolgan muddat</p>
                      <p className="mt-1 text-base font-semibold text-blue-600">{selectedItem.remainingMonths} oy</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Keyingi to'lov sanasi</p>
                      <p className="mt-1 text-base font-semibold text-orange-600">{formatDate(selectedItem.monthlyPaymentDeadline)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Oxirgi to'lov</p>
                    <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">
                      {selectedItem.lastPaymentDate ? formatDate(selectedItem.lastPaymentDate) : "-"}
                    </p>
                  </div>

                  {/* Payment Schedule */}
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">To'lov grafigi</p>
                    <div className="space-y-2">
                      {Array.from({ length: selectedItem.contractMonths }).map((_, idx) => {
                        const monthNumber = idx + 1;
                        const paidMonths = selectedItem.contractMonths - selectedItem.remainingMonths;
                        const isPaid = monthNumber <= paidMonths;
                        const isCurrent = monthNumber === paidMonths + 1;
                        const isPending = monthNumber > paidMonths + 1;
                        
                        // Calculate payment date for each month
                        const baseDate = new Date(selectedItem.monthlyPaymentDeadline);
                        const paymentDate = new Date(baseDate);
                        paymentDate.setMonth(paymentDate.getMonth() - (selectedItem.contractMonths - monthNumber));
                        
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                              isPaid ? 'bg-green-50 dark:bg-green-900/20' : 
                              isCurrent ? 'bg-red-50 dark:bg-red-900/20' : 
                              'bg-gray-50 dark:bg-navy-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isPaid && (
                                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isCurrent && (
                                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {isPending && (
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              <div className="flex flex-col">
                                <span className={`text-sm font-medium ${
                                  isPaid ? 'text-green-700 dark:text-green-400' : 
                                  isCurrent ? 'text-red-700 dark:text-red-400' : 
                                  'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {monthNumber}-oy
                                </span>
                                <span className={`text-xs ${
                                  isPaid ? 'text-green-600 dark:text-green-500' : 
                                  isCurrent ? 'text-red-600 dark:text-red-500' : 
                                  'text-gray-500 dark:text-gray-500'
                                }`}>
                                  {formatDate(paymentDate.toISOString())}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-semibold ${
                                isPaid ? 'text-green-600 dark:text-green-400' : 
                                isCurrent ? 'text-red-600 dark:text-red-400' : 
                                'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatCurrency(selectedItem.monthlyDebt)}
                              </span>
                              {isPaid && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  To'landi
                                </span>
                              )}
                              {isCurrent && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  Qarzdorlik
                                </span>
                              )}
                              {isPending && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                  Kutilmoqda
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "merchants" && 'merchantName' in selectedItem && 'fillialCount' in selectedItem && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Merchant nomi</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.merchantName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hudud</p>
                      <p className="mt-1 text-base font-semibold text-indigo-600">{selectedItem.region}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filiallar soni</p>
                      <p className="mt-1 text-base font-semibold text-indigo-600">{selectedItem.fillialCount} ta</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Qarzdor arizalar</p>
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 dark:bg-red-900/30">
                        <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-bold text-red-700 dark:text-red-400">{(selectedItem as MerchantDebt).debtApplicationsCount}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Qarzdor mijozlar</p>
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-900/30">
                        <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{(selectedItem as MerchantDebt).debtCustomersCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bu oygi qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-orange-600">{formatCurrency(selectedItem.monthlyDebt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Umumiy qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-red-600">{formatCurrency(selectedItem.totalDebt)}</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "fillials" && 'fillialName' in selectedItem && 'address' in selectedItem && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Filial nomi</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.fillialName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Merchant</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.merchantName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hudud</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.region}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manzil</p>
                      <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedItem.address}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bu oygi qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-orange-600">{formatCurrency(selectedItem.monthlyDebt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Umumiy qarzdorlik</p>
                      <p className="mt-1 text-base font-semibold text-red-600">{formatCurrency(selectedItem.totalDebt)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg bg-brand-500 px-6 py-2 font-medium text-white transition-colors hover:bg-brand-600"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
