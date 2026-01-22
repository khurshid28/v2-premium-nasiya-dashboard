import { useState, useMemo, useEffect } from "react";
import Card from "components/card";
import { Eye, Plus, Search, Phone } from "tabler-icons-react";
import CustomSelect from "components/dropdown/CustomSelect";
import Pagination from "components/pagination";
import DateRangePicker from "components/DateRangePicker";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Toast from "components/toast/ToastNew";
import { paymentApi, Payment as ApiPayment, PaymentProvider, PaymentStatus } from "lib/api/payment";
import * as api from "lib/api";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // MIB Payment Modal State
  const [showAddMibModal, setShowAddMibModal] = useState(false);
  const [mibSearchQuery, setMibSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [mibAmount, setMibAmount] = useState("");
  const [mibPaymentDate, setMibPaymentDate] = useState("");
  const [mibNotes, setMibNotes] = useState("");
  
  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Load payments from API
  useEffect(() => {
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProvider, filterStatus, startDate, endDate]);

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
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }
      
      const response = await paymentApi.getPayments(filters);
      
      // Response format: { value: [...], Count: number }
      const paymentsData = (response.data as any)?.value || response.data || [];
      
      // Map API data to component format
      const mappedPayments = paymentsData.map((payment: any) => ({
        ...payment,
        customerName: payment.client?.full_name || payment.zayavka?.fullname || 'N/A',
        customerPhone: payment.client?.phone || payment.zayavka?.phone || 'N/A',
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
      if (!searchQuery) return true;
      
      const search = searchQuery.toLowerCase().trim();
      
      // Check all possible fields
      const matchesId = payment.id?.toString().includes(searchQuery.trim());
      const matchesCustomerName = payment.customerName?.toLowerCase().includes(search);
      const matchesCustomerPhone = payment.customerPhone?.replace(/\s+/g, '').includes(search.replace(/\s+/g, ''));
      const matchesTransactionId = payment.transactionId?.toLowerCase().includes(search);
      const matchesCheckNumber = payment.checkNumber?.toLowerCase().includes(search);
      const matchesApplicationId = payment.applicationId?.toString().includes(searchQuery.trim());
      const matchesZayavkaId = payment.zayavka_id?.toString().includes(searchQuery.trim());

      return matchesId || matchesCustomerName || matchesCustomerPhone || 
             matchesTransactionId || matchesCheckNumber || matchesApplicationId || matchesZayavkaId;
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

  // Search for applications by ID, phone, fullname, or passport (auto-search)
  const handleSearchApplications = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSelectedApplication(null);
      return;
    }

    try {
      setLoadingSearch(true);
      
      // Check if search is ID-only (starts with #)
      const isIdSearch = query.trim().startsWith('#');
      const searchValue = isIdSearch ? query.trim().substring(1) : query.trim();
      
      // Real API call - search for CONFIRMED or FINISHED applications
      const response = await api.listZayavkalar({ 
        search: searchValue,
        status: 'CONFIRMED,FINISHED',
        pageSize: 20
      });
      
      const applications = response.items || [];
      
      // Debug: log first result to see structure
      if (applications.length > 0) {
        console.log('Application structure:', applications[0]);
      }
      
      // Filter results
      let filteredApps = applications.filter((app: any) => 
        app.status === 'CONFIRMED' || app.status === 'FINISHED'
      );
      
      // If ID-only search, filter by exact ID match
      if (isIdSearch && searchValue) {
        filteredApps = filteredApps.filter((app: any) => 
          app.id.toString() === searchValue
        );
      }
      
      setSearchResults(filteredApps);
      setLoadingSearch(false);
    } catch (error) {
      console.error("Error searching applications:", error);
      setSearchResults([]);
      setLoadingSearch(false);
    }
  };

  // Auto-search effect
  useEffect(() => {
    if (!showAddMibModal) return;
    
    const timeoutId = setTimeout(() => {
      handleSearchApplications(mibSearchQuery);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mibSearchQuery, showAddMibModal]);

  // Handle Add MIB Payment
  const handleAddMibPayment = async () => {
    if (!selectedApplication) {
      setToastMessage("Iltimos avval ariza tanlang");
      setToastType('warning');
      setToastOpen(true);
      return;
    }
    if (!mibAmount || !mibPaymentDate) {
      setToastMessage("Iltimos barcha majburiy maydonlarni to'ldiring");
      setToastType('warning');
      setToastOpen(true);
      return;
    }

    try {
      const payment = await paymentApi.createPayment({
        zayavka_id: selectedApplication.id,
        client_id: selectedApplication.client_id,
        amount: Number(mibAmount),
        provider: 'MIB',
        paymentType: 'INITIAL_PAYMENT',
        paymentDate: mibPaymentDate,
        notes: mibNotes
      });
      
      // MIB to'lovlarni darhol COMPLETED qilish
      const paymentId = (payment.data as any)?.id;
      if (paymentId) {
        await paymentApi.processPayment(paymentId, 'COMPLETED');
      }
      
      setToastMessage("MIB to'lov muvaffaqiyatli qo'shildi");
      setToastType('success');
      setToastOpen(true);
      
      // Reset form
      setMibSearchQuery("");
      setSearchResults([]);
      setSelectedApplication(null);
      setMibAmount("");
      setMibPaymentDate("");
      setMibNotes("");
      setShowAddMibModal(false);
      
      // Reload payments
      loadPayments();
    } catch (error: any) {
      console.error("Error adding MIB payment:", error);
      setToastMessage(error.response?.data?.message || "To'lov qo'shishda xatolik yuz berdi");
      setToastType('error');
      setToastOpen(true);
    }
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
          <button
            onClick={() => setShowAddMibModal(true)}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-600 hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            MIB to'lov qo'shish
          </button>
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
        <div className="mt-3">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
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
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-navy-700 dark:text-white">
                          {payment.customerName}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{payment.customerPhone}</span>
                        </div>
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
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{selectedPayment.customerPhone}</span>
                    </div>
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

      {/* Add MIB Payment Modal */}
      {showAddMibModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card extra="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-amber-500 px-6 py-4 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">MIB To'lov Qo'shish</h3>
                  <p className="mt-1 text-sm text-white/80">Qo'lda kiritilgan to'lov</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddMibModal(false);
                  setMibSearchQuery("");
                  setSearchResults([]);
                  setSelectedApplication(null);
                  setMibAmount("");
                  setMibPaymentDate("");
                  setMibNotes("");
                }}
                className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="space-y-5">
                {/* Step 1: Search Application */}
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
                  <h4 className="mb-3 text-sm font-bold text-amber-900 dark:text-amber-400">
                    1-qadam: Ariza qidirish
                  </h4>
                  <p className="mb-3 text-xs text-amber-800 dark:text-amber-300">
                    ID bo'yicha: #120, Umumiy: telefon, F.I.O yoki passport (faqat tasdiqlangan)
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={mibSearchQuery}
                      onChange={(e) => setMibSearchQuery(e.target.value)}
                      placeholder="ID: #120, Umumiy: +998901234567, Aliyev Vali, AB1234567..."
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                    />
                    {loadingSearch && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results - Multiple Cards */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-400">
                        {searchResults.length} ta natija topildi. Birini tanlang:
                      </p>
                      <div className="max-h-96 space-y-2 overflow-y-auto">
                        {searchResults.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                              selectedApplication?.id === app.id
                                ? "border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-900/30"
                                : "border-gray-200 bg-white hover:border-amber-300 dark:border-gray-700 dark:bg-navy-800 dark:hover:border-amber-600"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                selectedApplication?.id === app.id
                                  ? "bg-green-500"
                                  : "bg-amber-500"
                              }`}>
                                <span className="text-sm font-bold text-white">
                                  {selectedApplication?.id === app.id ? "✓" : "#"}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="mb-2 flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                                      Ariza #{app.id}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('uz-UZ') : 'N/A'}
                                    </p>
                                  </div>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    app.status === 'CONFIRMED'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                      : app.status === 'FINISHED'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                  }`}>
                                    {app.status === 'CONFIRMED' ? 'Tasdiqlangan' : app.status === 'FINISHED' ? 'Tugallangan' : app.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Mijoz:</span>
                                    <p className="font-medium text-navy-700 dark:text-white">
                                      {app.fullname || app.user?.fullname || 'N/A'}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                      <Phone className="h-3 w-3" />
                                      <span>{app.phone || app.user?.phone || 'N/A'}</span>
                                    </div>
                                    <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                                      🆔 {app.passport || app.user?.passport || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Do'kon:</span>
                                    <p className="font-medium text-navy-700 dark:text-white">
                                      {app.merchant?.name}
                                    </p>
                                    <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                                      {app.fillial?.name}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-500">
                                      {app.fillial?.region}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Summa:</span>
                                    <p className="font-bold text-green-600 dark:text-green-400">
                                      {formatCurrency(app.payment_amount || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Muddat:</span>
                                    <p className="font-medium text-navy-700 dark:text-white">
                                      {app.expired_month || 0} oy
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {!loadingSearch && mibSearchQuery && searchResults.length === 0 && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-900/50 dark:bg-red-900/20">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Tasdiqlangan ariza topilmadi. Boshqa qidiruv so'zi bilan urinib ko'ring.
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 2: Payment Details */}
                {selectedApplication && (
                  <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400">
                      2-qadam: To'lov ma'lumotlari
                    </h4>

                    {/* Amount */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Summa (so'm) *
                      </label>
                      <input
                        type="number"
                        value={mibAmount}
                        onChange={(e) => setMibAmount(e.target.value)}
                        placeholder="Masalan: 500000"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                      />
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        To'lov sanasi *
                      </label>
                      <div className="h-11 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 shadow-sm hover:shadow-md hover:border-brand-500 dark:hover:border-brand-400 transition-all duration-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <ReactDatePicker
                          selected={mibPaymentDate ? new Date(mibPaymentDate) : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              setMibPaymentDate(`${year}-${month}-${day}`);
                            } else {
                              setMibPaymentDate("");
                            }
                          }}
                          placeholderText="Sanani tanlang"
                          dateFormat="dd.MM.yyyy"
                          className="flex-1 text-sm font-medium bg-transparent dark:text-white border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
                          withPortal
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Izoh (ixtiyoriy)
                      </label>
                      <textarea
                        value={mibNotes}
                        onChange={(e) => setMibNotes(e.target.value)}
                        placeholder="Qo'shimcha ma'lumot..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddMibModal(false);
                    setMibSearchQuery("");
                    setSearchResults([]);
                    setSelectedApplication(null);
                    setMibAmount("");
                    setMibPaymentDate("");
                    setMibNotes("");
                  }}
                  className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddMibPayment}
                  disabled={!selectedApplication || !mibAmount || !mibPaymentDate}
                  className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  To'lov qo'shish
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
};

export default Payments;
