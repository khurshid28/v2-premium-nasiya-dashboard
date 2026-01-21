import { useState, useMemo, useEffect } from "react";
import Card from "components/card";
import { Eye, Plus, Search } from "tabler-icons-react";
import CustomSelect from "components/dropdown/CustomSelect";
import Pagination from "components/pagination";
import { paymentApi, Payment as ApiPayment, PaymentProvider, PaymentStatus } from "lib/api/payment";

// Payment Provider Types - mapped to API
type Provider = PaymentProvider;

// Payment Status Types - mapped to API
type Status = PaymentStatus;

// Payment Interface - using API type
interface Payment extends ApiPayment {
  customerName?: string;
  customerPhone?: string;
  applicationId?: string;
  branch?: string;
}

// Provider Labels - updated to match API
const PROVIDER_LABELS: Record<Provider, string> = {
  PLUM: "PLUM",
  PAYME: "PAYME",
  CLICK: "CLICK",
  UZUM: "UZUM",
  APELSIN: "APELSIN",
  AUTO: "AUTO",
  MIB: "MIB (Qo'lda)",
  CASH: "Naqd",
};

// Provider Colors - updated
const PROVIDER_COLORS: Record<Provider, string> = {
  PLUM: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  PAYME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CLICK: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  UZUM: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  APELSIN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  AUTO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  MIB: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CASH: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

// Status Labels - updated to match API
const STATUS_LABELS: Record<Status, string> = {
  COMPLETED: "Muvaffaqiyatli",
  PENDING: "Kutilmoqda",
  PROCESSING: "Jarayonda",
  FAILED: "Muvaffaqiyatsiz",
  CANCELLED: "Bekor qilingan",
  REFUNDED: "Qaytarilgan",
};

// Status Colors - updated
const STATUS_COLORS: Record<Status, string> = {
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  REFUNDED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const Payments = () => {
  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load payments from API
  useEffect(() => {
    loadPayments();
  }, [filterProvider, filterStatus, filterDateFrom, filterDateTo]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (filterProvider !== 'all') {
        filters.provider = filterProvider;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (filterDateFrom) {
        filters.startDate = filterDateFrom;
      }
      if (filterDateTo) {
        filters.endDate = filterDateTo;
      }
      
      const response = await paymentApi.getPayments(filters);
      // Response format: { value: [...], Count: number }
      const paymentsData = (response.data as any)?.value || response.data || [];
      
      // Map API data to component format
      const mappedPayments = paymentsData.map((payment: any) => ({
        ...payment,
        customerName: payment.client?.full_name || 'N/A',
        customerPhone: payment.client?.phone || 'N/A',
        applicationId: payment.zayavka_id ? String(payment.zayavka_id) : 'N/A',
        branch: payment.fillial?.name || 'N/A',
      }));
      
      setPayments(mappedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        !searchQuery ||
        payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerPhone?.includes(searchQuery) ||
        payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.applicationId?.includes(searchQuery);

      return matchesSearch;
    });
  }, [payments, searchQuery]);

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
    return new Date(date).toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // View Payment Detail
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  return (
    <div className="mt-3">
      {/* Header with Stats */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">💳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jami to'lovlar</p>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                {filteredData.length}
              </h4>
            </div>
          </div>
        </Card>

        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">✓</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Muvaffaqiyatli</p>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                {filteredData.filter((p) => p.status === "COMPLETED").length}
              </h4>
            </div>
          </div>
        </Card>

        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">⏳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kutilmoqda</p>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                {filteredData.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length}
              </h4>
            </div>
          </div>
        </Card>

        <Card extra="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jami summa</p>
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                {formatCurrency(filteredData.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0))}
              </h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card extra="w-full pb-10 p-4 h-full">
        <header className="relative flex items-center justify-between">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            To'lovlar
          </div>
        </header>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidiruv (mijoz, telefon, transaction ID)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>

          {/* Provider Filter */}
          <CustomSelect
            value={filterProvider}
            onChange={(val) => {
              setFilterProvider(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Barcha providerlar" },
              { value: "PAYME", label: "PAYME" },
              { value: "CLICK", label: "CLICK" },
              { value: "UZUM", label: "UZUM" },
              { value: "PLUM", label: "PLUM" },
              { value: "AUTO", label: "AUTO" },
              { value: "MIB", label: "MIB" },
              { value: "CASH", label: "Naqd" },
            ]}
          />

          {/* Status Filter */}
          <CustomSelect
            value={filterStatus}
            onChange={(val) => {
              setFilterStatus(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Barcha statuslar" },
              { value: "COMPLETED", label: "Muvaffaqiyatli" },
              { value: "PENDING", label: "Kutilmoqda" },
              { value: "PROCESSING", label: "Jarayonda" },
              { value: "FAILED", label: "Muvaffaqiyatsiz" },
              { value: "CANCELLED", label: "Bekor qilingan" },
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

        {/* Date Range Filters */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Boshlanish sanasi
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tugash sanasi
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-900 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-2">📭</span>
              <p>To'lovlar topilmadi</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    ID
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Mijoz
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Ariza ID
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Summa
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Provider
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="pb-3 text-left text-sm font-bold text-gray-600 dark:text-gray-400">
                    Sana
                  </th>
                  <th className="pb-3 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <td className="py-3 text-sm text-navy-700 dark:text-white">
                      #{payment.id}
                    </td>
                    <td className="py-3 text-sm">
                      <div>
                        <p className="font-medium text-navy-700 dark:text-white">
                          {payment.customerName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {payment.customerPhone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-navy-700 dark:text-white">
                      {payment.applicationId}
                    </td>
                    <td className="py-3 text-sm font-medium text-navy-700 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          PROVIDER_COLORS[payment.provider]
                        }`}
                      >
                        {PROVIDER_LABELS[payment.provider]}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_COLORS[payment.status]
                        }`}
                      >
                        {STATUS_LABELS[payment.status]}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
                      >
                        <Eye size={14} />
                        Ko'rish
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
              Jami {filteredData.length} ta to'lov, {(currentPage - 1) * pageSize + 1}-
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
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card extra="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-navy-800">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                To'lov tafsilotlari
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Payment Info Grid */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">To'lov ID</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      #{selectedPayment.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ariza ID</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {selectedPayment.applicationId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mijoz</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {selectedPayment.customerName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPayment.customerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Filial</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {selectedPayment.branch}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Summa</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Oy raqami</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {selectedPayment.monthNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Provider</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        PROVIDER_COLORS[selectedPayment.provider]
                      }`}
                    >
                      {PROVIDER_LABELS[selectedPayment.provider]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_COLORS[selectedPayment.status]
                      }`}
                    >
                      {STATUS_LABELS[selectedPayment.status]}
                    </span>
                  </div>
                </div>

                {selectedPayment.transactionId && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                    <p className="font-mono text-sm text-navy-700 dark:text-white">
                      {selectedPayment.transactionId}
                    </p>
                  </div>
                )}

                {selectedPayment.checkNumber && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check raqami</p>
                    <p className="font-mono text-sm text-navy-700 dark:text-white">
                      {selectedPayment.checkNumber}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">To'lov sanasi</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {formatDate(selectedPayment.paymentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yaratilgan</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {formatDate(selectedPayment.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedPayment.description && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tavsif</p>
                    <p className="text-sm text-navy-700 dark:text-white">
                      {selectedPayment.description}
                    </p>
                  </div>
                )}

                {selectedPayment.notes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Izoh</p>
                    <p className="text-sm text-navy-700 dark:text-white">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}
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

export default Payments;
