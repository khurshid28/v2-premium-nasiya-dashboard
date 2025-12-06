import { useState, useMemo } from "react";
import Card from "components/card";
import { Eye, Plus, Search } from "tabler-icons-react";
import CustomSelect from "components/dropdown/CustomSelect";
import Pagination from "components/pagination";

// Payment Provider Types
type PaymentProvider = "PLUM" | "PAYME" | "AUTO" | "MIB";

// Payment Status Types
type PaymentStatus = "completed" | "pending" | "failed";

// Payment Interface
interface Payment {
  id: string;
  applicationId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  provider: PaymentProvider;
  paymentDate: string;
  status: PaymentStatus;
  branch: string;
  transactionId?: string;
  notes?: string;
}

// Provider Labels
const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  PLUM: "PLUM",
  PAYME: "PAYME",
  AUTO: "AUTO",
  MIB: "MIB (Qo'lda)",
};

// Provider Colors
const PROVIDER_COLORS: Record<PaymentProvider, string> = {
  PLUM: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  PAYME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  AUTO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  MIB: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

// Status Labels
const STATUS_LABELS: Record<PaymentStatus, string> = {
  completed: "Muvaffaqiyatli",
  pending: "Kutilmoqda",
  failed: "Muvaffaqiyatsiz",
};

// Status Colors
const STATUS_COLORS: Record<PaymentStatus, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Mock Data
const mockPayments: Payment[] = [
  {
    id: "PAY001",
    applicationId: "1",
    customerName: "Aziz Valiyev",
    customerPhone: "+998901234567",
    amount: 5000000,
    provider: "PAYME",
    paymentDate: "2024-12-05T14:30:00",
    status: "completed",
    branch: "Chilonzor filiali",
    transactionId: "TXN123456789",
  },
  {
    id: "PAY002",
    applicationId: "2",
    customerName: "Dilnoza Karimova",
    customerPhone: "+998902345678",
    amount: 3500000,
    provider: "PLUM",
    paymentDate: "2024-12-05T10:15:00",
    status: "completed",
    branch: "Yunusobod filiali",
    transactionId: "PLM987654321",
  },
  {
    id: "PAY003",
    applicationId: "3",
    customerName: "Bobur Aliyev",
    customerPhone: "+998903456789",
    amount: 2000000,
    provider: "MIB",
    paymentDate: "2024-12-04T16:45:00",
    status: "completed",
    branch: "Sergeli filiali",
    notes: "Naqd pul qabul qilindi",
  },
  {
    id: "PAY004",
    applicationId: "4",
    customerName: "Gulnora Tursunova",
    customerPhone: "+998904567890",
    amount: 7500000,
    provider: "AUTO",
    paymentDate: "2024-12-04T12:20:00",
    status: "completed",
    branch: "Chilonzor filiali",
    transactionId: "AUTO555888999",
  },
  {
    id: "PAY005",
    applicationId: "5",
    customerName: "Jasur Rahmonov",
    customerPhone: "+998905678901",
    amount: 4200000,
    provider: "PAYME",
    paymentDate: "2024-12-03T09:30:00",
    status: "completed",
    branch: "Yunusobod filiali",
    transactionId: "TXN999888777",
  },
];

const Payments = () => {
  // State
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddMibModal, setShowAddMibModal] = useState(false);

  // MIB Form State
  const [mibApplicationId, setMibApplicationId] = useState("");
  const [mibCustomerName, setMibCustomerName] = useState("");
  const [mibCustomerPhone, setMibCustomerPhone] = useState("");
  const [mibAmount, setMibAmount] = useState("");
  const [mibPaymentDate, setMibPaymentDate] = useState("");
  const [mibNotes, setMibNotes] = useState("");

  // Quick Date Filter Functions
  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFilterDateFrom(toISODate(firstDay));
    setFilterDateTo(toISODate(lastDay));
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setFilterDateFrom(toISODate(firstDay));
    setFilterDateTo(toISODate(lastDay));
  };

  const setThisYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    setFilterDateFrom(toISODate(firstDay));
    setFilterDateTo(toISODate(lastDay));
  };

  const setLast30Days = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    setFilterDateFrom(toISODate(thirtyDaysAgo));
    setFilterDateTo(toISODate(now));
  };

  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format Currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Format DateTime
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Filter and Search
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.applicationId.includes(searchQuery) ||
        payment.customerPhone.includes(searchQuery);

      const matchesProvider = filterProvider === "all" || payment.provider === filterProvider;
      const matchesBranch = filterBranch === "all" || payment.branch === filterBranch;

      // Date range filter
      let matchesDateRange = true;
      if (filterDateFrom || filterDateTo) {
        const paymentDate = new Date(payment.paymentDate);
        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom);
          matchesDateRange = matchesDateRange && paymentDate >= fromDate;
        }
        if (filterDateTo) {
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && paymentDate <= toDate;
        }
      }

      return matchesSearch && matchesProvider && matchesBranch && matchesDateRange;
    });
  }, [payments, searchQuery, filterProvider, filterBranch, filterDateFrom, filterDateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const currentPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate Total Amount
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Statistics
  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
  };

  // Handle Add MIB Payment
  const handleAddMibPayment = () => {
    // TODO: Add validation and API call
    console.log("Adding MIB Payment:", {
      applicationId: mibApplicationId,
      customerName: mibCustomerName,
      customerPhone: mibCustomerPhone,
      amount: mibAmount,
      paymentDate: mibPaymentDate,
      notes: mibNotes,
    });

    // Reset form
    setMibApplicationId("");
    setMibCustomerName("");
    setMibCustomerPhone("");
    setMibAmount("");
    setMibPaymentDate("");
    setMibNotes("");
    setShowAddMibModal(false);
  };

  return (
    <div className="mt-5 h-full w-full">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white">To'lovlar</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Barcha to'lovlar ro'yxati</p>
          </div>
          <button
            onClick={() => setShowAddMibModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            MIB to'lov qo'shish
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Jami to'lovlar</p>
            <p className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
            <p className="text-xs font-medium text-green-700 dark:text-green-400">Muvaffaqiyatli</p>
            <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">{stats.completed}</p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/50 dark:bg-brand-900/20">
            <p className="text-xs font-medium text-brand-700 dark:text-brand-400">Jami summa</p>
            <p className="mt-2 text-lg font-bold text-brand-700 dark:text-brand-400">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Date Range Picker - Exact Copy */}
        <div className="mb-6 flex flex-col gap-3 max-w-md">
          {/* Date pickers in one container */}
          <div className="rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-3 shadow-sm hover:shadow-md hover:border-brand-500 dark:hover:border-brand-400 transition-all duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Boshlanish</label>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="text-sm font-medium bg-transparent dark:text-white rounded-md border-none outline-none w-full"
                  />
                </div>
              </div>

              <div className="w-px h-10 bg-gray-200 dark:bg-navy-500 flex-shrink-0"></div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tugash</label>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="text-sm font-medium bg-transparent dark:text-white rounded-md border-none outline-none w-full"
                  />
                </div>
              </div>

              {(filterDateFrom || filterDateTo) ? (
                <button 
                  type="button" 
                  onClick={() => { 
                    setFilterDateFrom(""); 
                    setFilterDateTo(""); 
                  }} 
                  title="Tozalash" 
                  className="flex-shrink-0 self-end mb-0.5 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {/* Quick select buttons - single row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={setThisMonth}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-navy-700 text-navy-700 dark:text-white border border-gray-200 dark:border-navy-600 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-navy-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              Bu oy
            </button>
            <button
              type="button"
              onClick={setLastMonth}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-navy-700 text-navy-700 dark:text-white border border-gray-200 dark:border-navy-600 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-navy-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              O'tgan oy
            </button>
            <button
              type="button"
              onClick={setLast30Days}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-navy-700 text-navy-700 dark:text-white border border-gray-200 dark:border-navy-600 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-navy-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Oxirgi 30 kun</span>
              <span className="sm:hidden">30 kun</span>
            </button>
            <button
              type="button"
              onClick={setThisYear}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-navy-700 text-navy-700 dark:text-white border border-gray-200 dark:border-navy-600 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-navy-600 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              Bu yil
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidiruv (ism, telefon, ariza ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
            />
          </div>

          {/* Provider Filter */}
          <CustomSelect
            value={filterProvider}
            onChange={setFilterProvider}
            placeholder="Provayderlar"
            options={[
              { value: "all", label: "Barchasi" },
              { value: "PLUM", label: "PLUM" },
              { value: "PAYME", label: "PAYME" },
              { value: "AUTO", label: "AUTO" },
              { value: "MIB", label: "MIB" },
            ]}
          />

          {/* Branch Filter */}
          <CustomSelect
            value={filterBranch}
            onChange={setFilterBranch}
            placeholder="Filiallar"
            options={[
              { value: "all", label: "Barchasi" },
              { value: "Chilonzor filiali", label: "Chilonzor" },
              { value: "Yunusobod filiali", label: "Yunusobod" },
              { value: "Sergeli filiali", label: "Sergeli" },
            ]}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Ariza ID</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Mijoz</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Filial</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Summa</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Provayder</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Sana</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Holat</th>
                <th className="pb-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-700">
                  <td className="py-4 text-sm font-bold text-navy-700 dark:text-white">{payment.applicationId}</td>
                  <td className="py-4">
                    <div>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">{payment.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{payment.customerPhone}</p>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{payment.branch}</td>
                  <td className="py-4 text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.amount)}</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${PROVIDER_COLORS[payment.provider]}`}>
                      {PROVIDER_LABELS[payment.provider]}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.paymentDate)}</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[payment.status]}`}>
                      {STATUS_LABELS[payment.status]}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailModal(true);
                      }}
                      className="rounded-lg p-2 text-brand-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/20"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {`${filteredPayments.length} dan ${currentPayments.length} ta ko'rsatilmoqda`}
          </div>
          <div className="flex items-center gap-3">
            <CustomSelect
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
              options={[
                { value: "10", label: "10 ta" },
                { value: "25", label: "25 ta" },
                { value: "50", label: "50 ta" },
                { value: "100", label: "100 ta" },
              ]}
              className="min-w-[120px]"
            />
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 px-8 py-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPayment(null);
                }}
                className="absolute right-6 top-6 z-10 rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4 pr-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">To'lov tafsilotlari</h3>
                  <p className="mt-1 text-sm text-white/80">{selectedPayment.id}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Application Info */}
                <div>
                  <h4 className="mb-3 text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Ariza ma'lumotlari</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Ariza ID</p>
                      <p className="mt-1 text-sm font-bold text-navy-700 dark:text-white">{selectedPayment.applicationId}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Mijoz</p>
                      <p className="mt-1 text-sm font-bold text-navy-700 dark:text-white">{selectedPayment.customerName}</p>
                      <p className="text-xs text-gray-500">{selectedPayment.customerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="mb-3 text-sm font-bold uppercase text-gray-500 dark:text-gray-400">To'lov ma'lumotlari</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
                      <p className="text-xs text-green-700 dark:text-green-400">Summa</p>
                      <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Provayder</p>
                      <p className="mt-1 text-sm font-bold text-navy-700 dark:text-white">{PROVIDER_LABELS[selectedPayment.provider]}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sana va vaqt</p>
                      <p className="mt-1 text-sm font-bold text-navy-700 dark:text-white">{formatDateTime(selectedPayment.paymentDate)}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Holat</p>
                      <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[selectedPayment.status]}`}>
                        {STATUS_LABELS[selectedPayment.status]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction ID */}
                {selectedPayment.transactionId && (
                  <div>
                    <h4 className="mb-3 text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Tranzaksiya ma'lumotlari</h4>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Tranzaksiya ID</p>
                      <p className="mt-1 font-mono text-sm font-bold text-navy-700 dark:text-white">{selectedPayment.transactionId}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPayment.notes && (
                  <div>
                    <h4 className="mb-3 text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Izohlar</h4>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedPayment.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPayment(null);
                }}
                className="mt-6 w-full rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add MIB Payment Modal */}
      {showAddMibModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-8 py-6">
              <button
                onClick={() => setShowAddMibModal(false)}
                className="absolute right-6 top-6 z-10 rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4 pr-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">MIB to'lov qo'shish</h3>
                  <p className="mt-1 text-sm text-white/80">Qo'lda kiritilgan to'lov</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="space-y-5">
                {/* Application ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Ariza ID *</label>
                  <input
                    type="text"
                    value={mibApplicationId}
                    onChange={(e) => setMibApplicationId(e.target.value)}
                    placeholder="Masalan: APP2024001"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mijoz ismi *</label>
                  <input
                    type="text"
                    value={mibCustomerName}
                    onChange={(e) => setMibCustomerName(e.target.value)}
                    placeholder="Masalan: Aziz Valiyev"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon raqami *</label>
                  <input
                    type="text"
                    value={mibCustomerPhone}
                    onChange={(e) => setMibCustomerPhone(e.target.value)}
                    placeholder="+998901234567"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Summa (so'm) *</label>
                  <input
                    type="number"
                    value={mibAmount}
                    onChange={(e) => setMibAmount(e.target.value)}
                    placeholder="5000000"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To'lov sanasi *</label>
                  <input
                    type="datetime-local"
                    value={mibPaymentDate}
                    onChange={(e) => setMibPaymentDate(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Izoh</label>
                  <textarea
                    value={mibNotes}
                    onChange={(e) => setMibNotes(e.target.value)}
                    placeholder="Qo'shimcha ma'lumotlar..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddMibModal(false)}
                  className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddMibPayment}
                  className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 hover:shadow-lg"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
