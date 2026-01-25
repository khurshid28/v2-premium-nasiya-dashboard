import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "components/card";
import { Search, User, FileText, CircleCheck, Phone, Calendar, MapPin, Download } from "tabler-icons-react";
import Pagination from "components/pagination";
import CustomSelect from "components/dropdown/CustomSelect";
import apiReal from "lib/api";
import demoApi from "lib/demoApi";

// Types
type Customer = {
  id: number;
  fullName: string;
  phone: string;
  passport: string;
  birthDate: string;
  region: string;
  address: string;
  registrationDate: string;
  totalApplications: number;
  activeApplications: number;
  completedApplications: number;
  rejectedApplications: number;
  debt: number;
  workPlace?: string; // Ishxona (kompaniya nomi) - eski field
  zayavkalar?: any[]; // Backend dan kelgan arizalar
  workplaces?: any[]; // Backend dan kelgan ishxonalar
  myid?: {
    id: number;
    response_id?: string | null;
    comparison_value?: number | null;
    passport?: string | null;
    profile?: any;
    createdAt?: string;
    updatedAt?: string;
  } | null;
};

const exportToExcel = (data: Customer[]) => {
  // Create CSV content
  const headers = [
    "ID",
    "Mijoz",
    "Telefon",
    "Passport",
    "Tug'ilgan sana",
    "Hudud",
    "Manzil",
    "Ro'yxatdan o'tgan",
    "Jami arizalar",
    "Faol arizalar",
    "Tugallangan",
    "Rad etilgan",
    "Qarz"
  ];
  
  const rows = data.map(customer => [
    customer.id,
    customer.fullName,
    customer.phone,
    customer.passport,
    customer.birthDate,
    customer.region,
    customer.address || "",
    customer.registrationDate,
    customer.totalApplications,
    customer.activeApplications,
    customer.completedApplications,
    customer.rejectedApplications,
    customer.debt
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  // Add BOM for UTF-8
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `mijozlar-${today}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function CustomersWithApi() {
  const location = useLocation();
  const api = useMemo(() => {
    const isDemoMode = location.pathname.startsWith('/demo');
    return isDemoMode ? demoApi : apiReal;
  }, [location.pathname]);

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // Barcha mijozlar
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [customerApplications, setCustomerApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const loadedCustomerIdRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.listCustomers();
      
      // API qaytargan format: { items: [...], total: 141, page: 1, pageSize: 20 }
      if (response && response.items && Array.isArray(response.items)) {
        // Barcha mijozlarni saqlash
        setAllCustomers(response.items);
      } else if (response && response.value && Array.isArray(response.value)) {
        // Agar eski formatda kelsa
        setAllCustomers(response.value);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadCustomerDetail = useCallback(async (customerId: number) => {
    try {
      setLoadingApplications(true);
      setCustomerApplications([]);
      
      // Backend dan to'liq customer ma'lumotini olish (zayavkalar bilan)
      const customerDetail = await api.getCustomer(customerId);
      
      if (customerDetail && customerDetail.zayavkalar && Array.isArray(customerDetail.zayavkalar)) {
        setCustomerApplications(customerDetail.zayavkalar);
        loadedCustomerIdRef.current = customerId;
      }
    } catch (error) {
      console.error("Failed to load customer detail:", error);
      setCustomerApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, [api]);

  // Load all customers once on mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Load customer detail with zayavkalar when modal opens
  useEffect(() => {
    if (showViewModal && selectedCustomer) {
      // Faqat yangi customer uchun yuklash
      if (loadedCustomerIdRef.current !== selectedCustomer.id) {
        loadCustomerDetail(selectedCustomer.id);
      }
    } else {
      // Modal yopilganda reset qilish
      loadedCustomerIdRef.current = null;
      setCustomerApplications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showViewModal, selectedCustomer?.id]);

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    allCustomers.forEach(customer => {
      if (customer.region) {
        uniqueRegions.add(customer.region);
      }
    });
    return Array.from(uniqueRegions).sort();
  }, [allCustomers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(customer => {
      // Search filter
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          customer.fullName.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower) ||
          customer.passport?.toLowerCase().includes(searchLower) ||
          (customer.workPlace && customer.workPlace.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Region filter
      if (selectedRegion !== "all" && customer.region !== selectedRegion) {
        return false;
      }

      return true;
    });
  }, [allCustomers, searchQuery, selectedRegion]);

  // Client-side pagination
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  // Calculate stats - filterlangan mijozlar uchun statistika
  const stats = useMemo(() => {
    return {
      totalCustomers: filteredCustomers.length,
      activeApplications: filteredCustomers.reduce((sum, c) => {
        if (c.zayavkalar && Array.isArray(c.zayavkalar)) {
          return sum + c.zayavkalar.filter((z: any) => z.status === 'CONFIRMED' || z.status === 'ACTIVE').length;
        }
        return sum + (c.activeApplications || 0);
      }, 0),
      completedApplications: filteredCustomers.reduce((sum, c) => {
        if (c.zayavkalar && Array.isArray(c.zayavkalar)) {
          return sum + c.zayavkalar.filter((z: any) => z.status === 'FINISHED' || z.status === 'COMPLETED').length;
        }
        return sum + (c.completedApplications || 0);
      }, 0),
      rejectedApplications: filteredCustomers.reduce((sum, c) => {
        if (c.zayavkalar && Array.isArray(c.zayavkalar)) {
          return sum + c.zayavkalar.filter((z: any) => z.status && (z.status.includes('CANCELED') || z.status === 'REJECTED')).length;
        }
        return sum + (c.rejectedApplications || 0);
      }, 0),
    };
  }, [filteredCustomers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString("uz-UZ");
    } catch {
      return '';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      // Confirmed
      'CONFIRMED': 'Tasdiqlangan',
      
      // Finished - multiple real statuses
      'FINISHED': 'Tugatilgan',
      'COMPLETED': 'Tugatilgan',
      'ACTIVE': 'Tugatilgan',
      
      // Rejected - multiple cancellation statuses from enum
      'CANCELED_BY_SCORING': 'Rad qilingan',
      'CANCELED_BY_CLIENT': 'Rad qilingan',
      'CANCELED_BY_DAILY': 'Rad qilingan',
      'CANCELLED': 'Rad qilingan',
      'CANCELED': 'Rad qilingan',
      'REJECTED': 'Rad qilingan',
      
      // Limit
      'LIMIT': 'Limit',
      
      // Pending - waiting statuses from enum
      'CREATED': 'Kutilmoqda',
      'ADDED_DETAIL': 'Kutilmoqda',
      'WAITING_SCORING': 'Kutilmoqda',
      'ADDED_PRODUCT': 'Kutilmoqda',
      'WAITING_BANK_UPDATE': 'Kutilmoqda',
      'WAITING_BANK_CONFIRM': 'Kutilmoqda',
      'PENDING': 'Kutilmoqda',
      'IN_PROGRESS': 'Kutilmoqda',
      'NEW': 'Kutilmoqda'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Card extra="w-full p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card extra="w-full p-6">
      {/* Header */}
      <header>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xl font-bold text-navy-700 dark:text-white">
              Mijozlar
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Barcha mijozlar va ularning arizalari
            </p>
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => exportToExcel(filteredCustomers)}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 active:scale-95"
          >
            <Download size={18} />
            Excel yuklash
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Mijoz ismi, telefon yoki passport bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-700 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <CustomSelect
            value={selectedRegion}
            onChange={setSelectedRegion}
            options={[
              { value: "all", label: "Barcha hududlar" },
              ...regions.map(r => ({ value: r, label: r }))
            ]}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jami mijozlar</p>
              <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{stats.totalCustomers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faol arizalar</p>
              <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{stats.activeApplications}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-violet-50 p-4 dark:border-gray-700 dark:from-purple-900/20 dark:to-violet-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yakunlangan</p>
              <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{stats.completedApplications}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
              <CircleCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 dark:border-gray-700 dark:from-red-900/20 dark:to-rose-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rad etilgan</p>
              <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{stats.rejectedApplications}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                #
              </th>
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Mijoz
              </th>
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Passport
              </th>
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Hudud
              </th>
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Ishxona
              </th>
              <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Arizalar
              </th>
              <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Qarzdorlik
              </th>
              <th className="pb-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Ro'yxatdan o'tgan
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer, index) => (
              <tr 
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowViewModal(true);
                }}
                className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-800"
              >
                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                      {customer.fullName.charAt(0).toUpperCase()}
                      {customer.activeApplications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-navy-900">
                          {customer.activeApplications}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-700 dark:text-white">
                        {customer.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <Phone className="mr-1 inline h-3 w-3" />
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-sm font-mono text-navy-700 dark:text-white">
                  {customer.passport}
                </td>
                <td className="py-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {customer.region}
                  </div>
                </td>
                <td className="py-4 text-sm text-navy-700 dark:text-white">
                  {customer.workplaces && customer.workplaces.length > 0 && customer.workplaces[0].workplace 
                    ? customer.workplaces[0].workplace.name 
                    : customer.workPlace || '—'}
                </td>
                <td className="py-4 text-center text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓ {customer.zayavkalar ? customer.zayavkalar.filter((z: any) => z.status === 'CONFIRMED' || z.status === 'ACTIVE').length : customer.activeApplications} faol
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      ✓ {customer.zayavkalar ? customer.zayavkalar.filter((z: any) => z.status === 'FINISHED' || z.status === 'COMPLETED').length : customer.completedApplications} tugagan
                    </span>
                  </div>
                </td>
                <td className="py-4 text-sm">
                  {customer.debt > 0 ? (
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(customer.debt)} so'm
                    </span>
                  ) : (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      Qarzi yo'q
                    </span>
                  )}
                </td>
                <td className="py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(customer.registrationDate)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedCustomers.length === 0 && (
          <div className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Mijozlar topilmadi
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedCustomers.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-navy-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white">
                  {selectedCustomer.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                    {selectedCustomer.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCustomer(null);
                }}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Passport</label>
                    <p className="mt-1 text-sm font-semibold text-navy-700 dark:text-white">{selectedCustomer.passport}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tug'ilgan sana</label>
                    <p className="mt-1 text-sm text-navy-700 dark:text-white">
                      {selectedCustomer.birthDate ? formatDate(selectedCustomer.birthDate) : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hudud</label>
                    <p className="mt-1 text-sm text-navy-700 dark:text-white">{selectedCustomer.region}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Manzil</label>
                    <p className="mt-1 text-sm text-navy-700 dark:text-white">{selectedCustomer.address}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Ishxona</label>
                    <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedCustomer.workplaces && selectedCustomer.workplaces.length > 0 && selectedCustomer.workplaces[0].workplace 
                        ? selectedCustomer.workplaces[0].workplace.name 
                        : selectedCustomer.workPlace || <span className="text-gray-400">—</span>}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Jami arizalar</label>
                    <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
                      {selectedCustomer.zayavkalar ? selectedCustomer.zayavkalar.length : selectedCustomer.totalApplications || 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Faol</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {selectedCustomer.zayavkalar ? selectedCustomer.zayavkalar.filter((z: any) => z.status === 'CONFIRMED' || z.status === 'ACTIVE').length : selectedCustomer.activeApplications || 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Tugagan</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {selectedCustomer.zayavkalar ? selectedCustomer.zayavkalar.filter((z: any) => z.status === 'FINISHED' || z.status === 'COMPLETED').length : selectedCustomer.completedApplications || 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-900/20">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Rad</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {selectedCustomer.zayavkalar ? selectedCustomer.zayavkalar.filter((z: any) => z.status && (z.status.includes('CANCELED') || z.status === 'REJECTED')).length : selectedCustomer.rejectedApplications || 0}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Qarzdorlik</label>
                    <p className="mt-1 text-xl font-bold">
                      {selectedCustomer.debt > 0 ? (
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(selectedCustomer.debt)} so'm
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">Qarzi yo'q</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* MyID ma'lumotlari */}
              {selectedCustomer.myid?.profile && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">MyID ma'lumotlari</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">PINFL</label>
                      <p className="mt-1 text-sm font-mono font-semibold text-navy-700 dark:text-white">
                        {selectedCustomer.myid.profile.common_data?.pinfl || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tug'ilgan sana</label>
                      <p className="mt-1 text-sm text-navy-700 dark:text-white">
                        {selectedCustomer.myid.profile.common_data?.birth_date || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Jinsi</label>
                      <p className="mt-1 text-sm text-navy-700 dark:text-white">
                        {selectedCustomer.myid.profile.common_data?.gender === '1' ? 'Erkak' : selectedCustomer.myid.profile.common_data?.gender === '2' ? 'Ayol' : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Millati</label>
                      <p className="mt-1 text-sm text-navy-700 dark:text-white">
                        {selectedCustomer.myid.profile.common_data?.nationality || '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Doimiy manzil</label>
                      <p className="mt-1 text-sm text-navy-700 dark:text-white">
                        {selectedCustomer.myid.profile.address?.permanent_registration?.address || '—'}
                      </p>
                    </div>
                    {selectedCustomer.myid.profile.address?.temporary_registration && (
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Vaqtinchalik manzil</label>
                        <p className="mt-1 text-sm text-navy-700 dark:text-white">
                          {selectedCustomer.myid.profile.address.temporary_registration.address || '—'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Arizalar ro'yxati */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-navy-700 dark:text-white">Arizalar</h4>
                  {loadingApplications && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {customerApplications.length === 0 && !loadingApplications ? (
                    <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">Arizalar yo'q</p>
                  ) : (
                    customerApplications.map((app: any) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          const basePath = location.pathname.startsWith('/demo') ? '/demo' : '/super';
                          navigate(`${basePath}/applications/${app.id}`);
                        }}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-all hover:border-brand-500 hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-navy-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            // Green: Confirmed and Finished statuses
                            app.status === 'CONFIRMED' || app.status === 'FINISHED' || app.status === 'COMPLETED' || app.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            // Red: All cancellation/rejection statuses
                            : app.status === 'REJECTED' || app.status === 'CANCELLED' || app.status === 'CANCELED' || 
                              app.status === 'CANCELED_BY_SCORING' || app.status === 'CANCELED_BY_CLIENT' || app.status === 'CANCELED_BY_DAILY'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            // Yellow: Limit and all waiting/pending statuses
                            : app.status === 'LIMIT' || app.status === 'PENDING' || app.status === 'CREATED' || 
                              app.status === 'ADDED_DETAIL' || app.status === 'WAITING_SCORING' || app.status === 'ADDED_PRODUCT' || 
                              app.status === 'WAITING_BANK_UPDATE' || app.status === 'WAITING_BANK_CONFIRM'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            // Blue: Other statuses
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy-700 dark:text-white">
                              #{app.id}{app.amount && app.amount > 0 ? ` - ${formatCurrency(app.amount)} so'm` : ''}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(app.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            // Green: Confirmed and Finished statuses
                            app.status === 'CONFIRMED' || app.status === 'FINISHED' || app.status === 'COMPLETED' || app.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            // Red: All cancellation/rejection statuses
                            : app.status === 'REJECTED' || app.status === 'CANCELLED' || app.status === 'CANCELED' || 
                              app.status === 'CANCELED_BY_SCORING' || app.status === 'CANCELED_BY_CLIENT' || app.status === 'CANCELED_BY_DAILY'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            // Yellow: Limit and all waiting/pending statuses
                            : app.status === 'LIMIT' || app.status === 'PENDING' || app.status === 'CREATED' || 
                              app.status === 'ADDED_DETAIL' || app.status === 'WAITING_SCORING' || app.status === 'ADDED_PRODUCT' || 
                              app.status === 'WAITING_BANK_UPDATE' || app.status === 'WAITING_BANK_CONFIRM'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            // Blue: Other statuses
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {getStatusText(app.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCustomer(null);
                }}
                className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
