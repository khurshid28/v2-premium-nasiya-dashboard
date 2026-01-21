import { useState, useMemo, useEffect } from "react";
import { User, FileText, BuildingStore, Search } from "tabler-icons-react";
import Card from "components/card";
import CustomSelect from "components/dropdown/CustomSelect";
import Pagination from "components/pagination";
import { paymentApi } from "lib/api/payment";

// Debt Interface
interface Debt {
  zayavka_id: number;
  totalAmount: number;
  totalPaid: number;
  totalDebt: number;
  monthlyAmount: number;
  totalMonths: number;
  currentMonth: number;
  overallStatus: string;
  client: {
    id: number;
    full_name: string;
    phone: string;
    passport: string;
    birth_date: string;
  };
  merchant: {
    id: number;
    name: string;
  };
  fillial: {
    id: number;
    name: string;
    region: string;
  };
  zayavkaCreatedAt: string;
  monthlyPayments: Array<{
    monthNumber: number;
    dueDate: string;
    expectedAmount: number;
    paidAmount: number;
    debtAmount: number;
    status: string;
    payments: number;
  }>;
}

const Debts = () => {
  // State
  const [view, setView] = useState<"customer" | "application">("customer");
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterMerchant, setFilterMerchant] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load debts from API
  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (filterMerchant !== 'all' && !isNaN(Number(filterMerchant))) {
        filters.merchant_id = Number(filterMerchant);
      }
      
      const response = await paymentApi.getAllDebts(filters);
      // Response format: { totalDebts: number, totalDebtAmount: number, debts: [...] }
      const debtsData = response.data.debts || [];
      
      setDebts(debtsData);
    } catch (error) {
      console.error('Error loading debts:', error);
      setDebts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique regions and merchants for filters
  const uniqueRegions = useMemo(() => {
    const regions = new Set(debts.map(d => d.fillial.region));
    return Array.from(regions).sort();
  }, [debts]);

  const uniqueMerchants = useMemo(() => {
    const merchants = new Map(debts.map(d => [d.merchant.id, d.merchant.name]));
    return Array.from(merchants.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [debts]);

  // Group debts by customer
  const customerDebts = useMemo(() => {
    const grouped = new Map<number, { client: any; applications: Debt[]; totalDebt: number }>();
    
    debts.forEach(debt => {
      const clientId = debt.client.id;
      if (!grouped.has(clientId)) {
        grouped.set(clientId, {
          client: debt.client,
          applications: [],
          totalDebt: 0,
        });
      }
      const group = grouped.get(clientId)!;
      group.applications.push(debt);
      group.totalDebt += debt.totalDebt;
    });
    
    return Array.from(grouped.values());
  }, [debts]);

  // Filtered data
  const filteredData = useMemo(() => {
    const dataToFilter: any[] = view === "customer" ? customerDebts : debts;
    
    return dataToFilter.filter((item: any) => {
      const matchesSearch = view === "customer"
        ? !searchQuery ||
          item.client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.client.phone?.includes(searchQuery) ||
          item.client.passport?.toLowerCase().includes(searchQuery.toLowerCase())
        : !searchQuery ||
          item.client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.client.phone?.includes(searchQuery) ||
          String(item.zayavka_id).includes(searchQuery);

      const matchesRegion = view === "customer"
        ? filterRegion === "all" || item.applications.some((app: Debt) => app.fillial.region === filterRegion)
        : filterRegion === "all" || item.fillial.region === filterRegion;

      const matchesMerchant = view === "customer"
        ? filterMerchant === "all" || item.applications.some((app: Debt) => String(app.merchant.id) === filterMerchant)
        : filterMerchant === "all" || String(item.merchant.id) === filterMerchant;

      return matchesSearch && matchesRegion && matchesMerchant;
    });
  }, [view, customerDebts, debts, searchQuery, filterRegion, filterMerchant]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' so\'m';
  };

  // Format date
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // View Debt Detail
  const handleViewDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowDetailModal(true);
  };

  // Calculate total debt
  const totalDebtAmount = useMemo(() => {
    return filteredData.reduce((sum: number, item: any) => {
      return sum + (view === "customer" ? item.totalDebt : item.totalDebt);
    }, 0);
  }, [filteredData, view]);

  return (
    <div className="mt-3">
      {/* Header with Stats */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <span className="text-lg font-bold text-red-600 dark:text-red-400">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {view === "customer" ? "Qarzdor mijozlar" : "Qarzdor arizalar"}
              </p>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                {filteredData.length}
              </h4>
            </div>
          </div>
        </Card>

        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jami qarz</p>
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                {formatCurrency(totalDebtAmount)}
              </h4>
            </div>
          </div>
        </Card>

        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">O'rtacha qarz</p>
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                {filteredData.length > 0
                  ? formatCurrency(Math.round(totalDebtAmount / filteredData.length))
                  : formatCurrency(0)}
              </h4>
            </div>
          </div>
        </Card>

        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">🏢</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jami arizalar</p>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                {debts.length}
              </h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card extra="w-full pb-10 p-4 h-full">
        <header className="relative flex items-center justify-between">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Qarzdorlik
          </div>
        </header>

        {/* View Tabs */}
        <div className="mt-4 flex gap-2 border-b border-gray-200 dark:border-white/10">
          <button
            onClick={() => {
              setView("customer");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "customer"
                ? "border-b-2 border-brand-500 text-brand-500"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <User className="mb-1 inline h-4 w-4" /> Mijozlar bo'yicha
          </button>
          <button
            onClick={() => {
              setView("application");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "application"
                ? "border-b-2 border-brand-500 text-brand-500"
                : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FileText className="mb-1 inline h-4 w-4" /> Arizalar bo'yicha
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={view === "customer" ? "Mijoz qidiruv..." : "Ariza qidiruv..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>

          {/* Region Filter */}
          <CustomSelect
            value={filterRegion}
            onChange={(val) => {
              setFilterRegion(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Barcha hududlar" },
              ...uniqueRegions.map(region => ({ value: region, label: region })),
            ]}
          />

          {/* Merchant Filter */}
          <CustomSelect
            value={filterMerchant}
            onChange={(val) => {
              setFilterMerchant(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Barcha merchantlar" },
              ...uniqueMerchants.map(m => ({ value: String(m.id), label: m.name })),
            ]}
          />

          {/* Page Size */}
          <CustomSelect
            value={String(pageSize)}
            onChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
            options={[
              { value: "10", label: "10 ta" },
              { value: "20", label: "20 ta" },
              { value: "50", label: "50 ta" },
              { value: "100", label: "100 ta" },
            ]}
          />
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <span className="mb-2 text-4xl">✅</span>
              <p>Qarzdorlik topilmadi</p>
            </div>
          ) : view === "customer" ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Mijoz
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Passport
                  </th>
                  <th className="pb-3 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    Arizalar soni
                  </th>
                  <th className="pb-3 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                    Jami qarz
                  </th>
                  <th className="pb-3 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <td className="py-3 text-sm">
                      <div>
                        <p className="font-medium text-navy-700 dark:text-white">
                          {item.client.full_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.client.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-navy-700 dark:text-white">
                      {item.client.passport}
                    </td>
                    <td className="py-3 text-center text-sm font-medium text-navy-700 dark:text-white">
                      {item.applications.length}
                    </td>
                    <td className="py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(item.totalDebt)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleViewDebt(item.applications[0])}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
                      >
                        Batafsil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Ariza ID
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Mijoz
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Merchant / Filial
                  </th>
                  <th className="pb-3 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    Muddat
                  </th>
                  <th className="pb-3 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                    Jami summa
                  </th>
                  <th className="pb-3 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                    To'langan
                  </th>
                  <th className="pb-3 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                    Qarz
                  </th>
                  <th className="pb-3 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((debt: Debt, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <td className="py-3 text-sm font-medium text-navy-700 dark:text-white">
                      #{debt.zayavka_id}
                    </td>
                    <td className="py-3 text-sm">
                      <div>
                        <p className="font-medium text-navy-700 dark:text-white">
                          {debt.client.full_name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {debt.client.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-navy-700 dark:text-white">
                      <div>
                        <p className="font-medium">{debt.merchant.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {debt.fillial.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm text-navy-700 dark:text-white">
                      {debt.currentMonth} / {debt.totalMonths}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-navy-700 dark:text-white">
                      {formatCurrency(debt.totalAmount)}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(debt.totalPaid)}
                    </td>
                    <td className="py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(debt.totalDebt)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleViewDebt(debt)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
                      >
                        Batafsil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginatedData.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Jami {filteredData.length} ta, {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredData.length)} ko'rsatilmoqda
            </p>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card extra="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-navy-800">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Qarzdorlik tafsilotlari - Ariza #{selectedDebt.zayavka_id}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Summary Info */}
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jami summa</p>
                  <p className="text-xl font-bold text-navy-700 dark:text-white">
                    {formatCurrency(selectedDebt.totalAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">To'langan</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(selectedDebt.totalPaid)}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Qarz</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(selectedDebt.totalDebt)}
                  </p>
                </div>
              </div>

              {/* Monthly Payments Table */}
              <h4 className="mb-3 font-bold text-navy-700 dark:text-white">
                Oylik to'lovlar jadvali
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="pb-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400">
                        Oy
                      </th>
                      <th className="pb-2 text-left text-xs font-bold text-gray-600 dark:text-gray-400">
                        To'lov sanasi
                      </th>
                      <th className="pb-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400">
                        Kerak
                      </th>
                      <th className="pb-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400">
                        To'langan
                      </th>
                      <th className="pb-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400">
                        Qarz
                      </th>
                      <th className="pb-2 text-center text-xs font-bold text-gray-600 dark:text-gray-400">
                        To'lovlar soni
                      </th>
                      <th className="pb-2 text-center text-xs font-bold text-gray-600 dark:text-gray-400">
                        Holat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDebt.monthlyPayments.map((month, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 dark:border-white/10 ${
                          month.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/10' : ''
                        }`}
                      >
                        <td className="py-2 text-sm text-navy-700 dark:text-white">
                          {month.monthNumber}
                        </td>
                        <td className="py-2 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(month.dueDate)}
                        </td>
                        <td className="py-2 text-right text-sm text-navy-700 dark:text-white">
                          {formatCurrency(month.expectedAmount)}
                        </td>
                        <td className="py-2 text-right text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(month.paidAmount)}
                        </td>
                        <td className="py-2 text-right text-sm font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(month.debtAmount)}
                        </td>
                        <td className="py-2 text-center text-sm text-navy-700 dark:text-white">
                          {month.payments}
                        </td>
                        <td className="py-2 text-center text-xs">
                          <span
                            className={`inline-block rounded-full px-2 py-1 font-medium ${
                              month.status === 'paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : month.status === 'overdue'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {month.status === 'paid'
                              ? 'To\'langan'
                              : month.status === 'overdue'
                              ? 'Kechikkan'
                              : 'Kutilmoqda'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  Yopish
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Debts;
