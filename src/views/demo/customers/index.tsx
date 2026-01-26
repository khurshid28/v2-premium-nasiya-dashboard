import { useState, useMemo, useEffect } from "react";
import Card from "components/card";
import { Search, User, FileText, BuildingStore, Calendar, ShieldCheck, Phone, DeviceMobile, CircleCheck, Eye, CurrencyDollar } from "tabler-icons-react";
import Pagination from "components/pagination";
import CustomSelect from "components/dropdown/CustomSelect";
import DateRangePicker from "components/DateRangePicker";
import * as api from "lib/api";

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
};

// Mock Data
// Format functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Load ALL customers from API once
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.listCustomers({
        page: 1,
        pageSize: 1000, // Load all customers at once
      });
      console.log('API Response:', response);
      console.log('Loaded customers:', response.value?.length, 'Total:', response.Count);
      if (!response.value || response.value.length === 0) {
        console.warn('No customers returned from API');
      }
      setAllCustomers(response.value || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('Xatolik: ' + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers by search query and date range (frontend)
  const filteredCustomers = useMemo(() => {
    let filtered = allCustomers;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((customer) =>
        customer.fullName.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.passport.toLowerCase().includes(query)
      );
    }
    
    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((customer) => {
        const customerDate = new Date(customer.registrationDate);
        if (startDate) {
          const start = new Date(startDate);
          if (customerDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (customerDate > end) return false;
        }
        return true;
      });
    }
    
    return filtered;
  }, [allCustomers, searchQuery, startDate, endDate]);

  // Pagination (frontend)
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const customers = filteredCustomers.slice(startIndex, endIndex);

  const handleViewCustomer = async (customer: Customer) => {
    console.log('Clicked customer:', customer);
    setSelectedCustomer(customer);
    setSelectedCustomerDetail(null);
    setShowDetailModal(true);
    setLoadingDetail(true);
    
    // Load full customer details
    try {
      const detail = await api.getCustomer(customer.id);
      console.log('Customer detail loaded:', detail);
      console.log('MyID data:', detail?.myid);
      console.log('Has MyID:', !!detail?.myid);
      if (detail?.myid) {
        console.log('MyID profile:', detail.myid.profile);
      }
      setSelectedCustomerDetail(detail);
    } catch (error) {
      console.error('Error loading customer detail:', error);
      alert('Mijoz ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="mt-5 h-full w-full">
      <Card extra="w-full pb-10 p-4 h-full">
        {/* Header */}
        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/50">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                Mijozlar
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Barcha mijozlar va ularning arizalari
              </p>
            </div>
          </div>
        </header>

        {/* Search and Date Filter */}
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
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jami mijozlar</p>
                <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{allCustomers.length}</p>
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
                <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
                  {allCustomers.reduce((sum, c) => sum + (c.activeApplications || 0), 0)}
                </p>
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
                <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
                  {allCustomers.reduce((sum, c) => sum + (c.completedApplications || 0), 0)}
                </p>
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
                <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
                  {allCustomers.reduce((sum, c) => sum + (c.rejectedApplications || 0), 0)}
                </p>
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
                  Hudud
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Arizalar
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Qarzdorlik
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Ro'yxatdan o'tgan
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Batafsil
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                          {customer.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-navy-700 dark:text-white">{customer.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{customer.passport}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-indigo-600 dark:text-indigo-400">
                      {customer.region || "—"}
                    </td>
                    <td className="py-4 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {customer.activeApplications} faol
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {customer.completedApplications} tugagan
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm">
                      {customer.debt > 0 ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {new Intl.NumberFormat("uz-UZ").format(customer.debt)} so'm
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Yo'q</span>
                      )}
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(customer.registrationDate)}
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-brand-500 dark:text-brand-400">
                        <Eye className="h-4 w-4" />
                        Batafsil
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {searchQuery 
              ? `${filteredCustomers.length} ta topildi (${allCustomers.length} dan)` 
              : `${filteredCustomers.length} dan ${customers.length} ta ko'rsatilmoqda`}
          </div>
          <div className="flex items-center gap-3">
            <CustomSelect
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
              options={[
                { value: "5", label: "5 ta" },
                { value: "10", label: "10 ta" },
                { value: "25", label: "25 ta" },
                { value: "50", label: "50 ta" }
              ]}
              className="min-w-[100px] sm:min-w-[120px]"
            />
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                Mijoz ma'lumotlari
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

            {/* Customer Info */}
            {loadingDetail ? (
              <div className="py-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
              </div>
            ) : selectedCustomerDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">F.I.O</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefon</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.phone || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passport</p>
                  <p className="mt-1 text-base font-mono font-semibold text-navy-700 dark:text-white">{selectedCustomer.passport}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tug'ilgan sana</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.birthDate ? formatDate(selectedCustomer.birthDate) : "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hudud</p>
                  <p className="mt-1 text-base font-semibold text-indigo-600">{selectedCustomer.region || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manzil</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.address || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ro'yxatdan o'tgan sana</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.registrationDate ? formatDate(selectedCustomer.registrationDate) : "—"}</p>
                </div>
              </div>

              {/* MyID Information Section */}
              {selectedCustomerDetail?.myid?.profile && (
                <>
                  {/* Shaxsiy ma'lumotlar */}
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                        Shaxsiy ma'lumotlar (MyID)
                      </h4>
                    </div>
                    <div className="space-y-4 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-white p-4 dark:border-green-900/50 dark:from-green-900/20 dark:to-navy-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCustomerDetail.myid.profile.common_data?.pinfl && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">PINFL</p>
                            <p className="text-base font-mono font-bold text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.pinfl}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.common_data?.birth_date && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tug'ilgan sana</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.birth_date}
                            </p>
                          </div>
                        )}
                        {(selectedCustomerDetail.myid.profile.common_data?.last_name_en || selectedCustomerDetail.myid.profile.common_data?.first_name_en) && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">F.I.O (Lotin)</p>
                            <p className="text-base font-semibold text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.last_name_en} {selectedCustomerDetail.myid.profile.common_data.first_name_en} {selectedCustomerDetail.myid.profile.common_data.middle_name_en || ''}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.common_data?.last_name && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">F.I.O (Kirill)</p>
                            <p className="text-base font-semibold text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.last_name} {selectedCustomerDetail.myid.profile.common_data.first_name} {selectedCustomerDetail.myid.profile.common_data.middle_name}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.common_data?.birth_place && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tug'ilgan joy</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.birth_place}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.common_data?.gender && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Jinsi</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.gender === '1' ? 'Erkak' : selectedCustomerDetail.myid.profile.common_data.gender === '2' ? 'Ayol' : selectedCustomerDetail.myid.profile.common_data.gender === 1 ? 'Erkak' : 'Ayol'}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.common_data?.nationality && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Millati</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.nationality}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.common_data?.citizenship && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fuqaroligi</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.citizenship}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Passport ma'lumotlari */}
                  {selectedCustomerDetail.myid.profile.doc_data && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="mb-3">
                        <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                          Pasport ma'lumotlari
                        </h4>
                      </div>
                      <div className="space-y-4 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-4 dark:border-indigo-900/50 dark:from-indigo-900/20 dark:to-navy-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCustomerDetail.myid.profile.doc_data?.pass_data && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Pasport seriya va raqami</p>
                              <p className="text-base font-mono font-bold text-navy-700 dark:text-white">
                                {selectedCustomerDetail.myid.profile.doc_data.pass_data}
                              </p>
                            </div>
                          )}
                          {selectedCustomerDetail.myid.profile.doc_data?.doc_type && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Hujjat turi</p>
                              <p className="text-base font-medium text-navy-700 dark:text-white">
                                {selectedCustomerDetail.myid.profile.doc_data.doc_type}
                              </p>
                            </div>
                          )}
                          {selectedCustomerDetail.myid.profile.doc_data?.issued_date && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Berilgan sana</p>
                              <p className="text-base font-medium text-navy-700 dark:text-white">
                                {selectedCustomerDetail.myid.profile.doc_data.issued_date}
                              </p>
                            </div>
                          )}
                          {selectedCustomerDetail.myid.profile.doc_data?.expiry_date && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Amal qilish muddati</p>
                              <p className="text-base font-medium text-navy-700 dark:text-white">
                                {selectedCustomerDetail.myid.profile.doc_data.expiry_date}
                              </p>
                            </div>
                          )}
                          {selectedCustomerDetail.myid.profile.doc_data?.issued_by && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Kim tomonidan berilgan</p>
                              <p className="text-base font-medium text-navy-700 dark:text-white">
                                {selectedCustomerDetail.myid.profile.doc_data.issued_by}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manzil ma'lumotlari */}
                  {(selectedCustomerDetail.myid.profile.address_data?.permanent_registration || 
                    selectedCustomerDetail.myid.profile.address_data?.temporary_registration) && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="mb-3">
                        <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                          Manzil ma'lumotlari
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {selectedCustomerDetail.myid.profile.address_data?.permanent_registration && (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Doimiy ro'yxatga olish manzili</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.address_data.permanent_registration}
                            </p>
                          </div>
                        )}
                        {selectedCustomerDetail.myid.profile.address_data?.temporary_registration && (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Vaqtinchalik ro'yxatga olish manzili</p>
                            <p className="text-base font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.address_data.temporary_registration}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Workplaces Section */}
              {selectedCustomerDetail?.workplaces && selectedCustomerDetail.workplaces.length > 0 && (
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center gap-2">
                    <BuildingStore className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      Ish joylari ({selectedCustomerDetail.workplaces.length})
                    </p>
                  </div>
                  <div className="space-y-3">
                    {selectedCustomerDetail.workplaces.map((cw: any) => (
                      <div
                        key={cw.id}
                        className="rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50/30 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-indigo-900/10"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <BuildingStore className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <p className="font-bold text-navy-700 dark:text-white">
                                  {cw.workplace?.name || "—"}
                                </p>
                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                  {cw.position}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {cw.is_current && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                                  Joriy ish joyi
                                </span>
                              )}
                              {cw.workplace?.work_type && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  {cw.workplace.work_type}
                                </span>
                              )}
                              {cw.workplace?.inn && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-mono text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  INN: {cw.workplace.inn}
                                </span>
                              )}
                            </div>
                            {(cw.start_date || cw.end_date) && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  {cw.start_date && formatDate(cw.start_date)}
                                  {cw.end_date ? ` - ${formatDate(cw.end_date)}` : ' - hozir'}
                                </span>
                              </div>
                            )}
                            {cw.workplace?.address && (
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                📍 {cw.workplace.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications Section */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">
                  Arizalar ro'yxati ({selectedCustomerDetail?.zayavkalar?.length || 0})
                </p>
                {!selectedCustomerDetail?.zayavkalar || selectedCustomerDetail.zayavkalar.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Arizalar mavjud emas</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomerDetail.zayavkalar.map((zayavka: any) => {
                      // Get first product from products array
                      const product = zayavka.products?.[0] || null;
                      return (
                      <div
                        key={zayavka.id}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-500">#{zayavka.id}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {zayavka.createdAt ? formatDate(zayavka.createdAt) : "—"}
                            </span>
                            <div className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {zayavka.status || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="font-semibold text-navy-700 dark:text-white">
                              {product?.name || "Mahsulot nomi yo'q"}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Narxi: {product?.price ? formatCurrency(product.price) : "—"} 
                              {zayavka.full_price && ` • Jami: ${formatCurrency(zayavka.full_price)}`}
                            </p>
                          </div>
                          {zayavka.fillial && (
                            <div className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400">
                              <BuildingStore className="h-4 w-4" />
                              <span>{zayavka.fillial.merchant?.name || zayavka.merchant?.name || "—"} - {zayavka.fillial.name || "—"}</span>
                              {zayavka.fillial.region && (
                                <span className="text-xs text-gray-500">({zayavka.fillial.region})</span>
                              )}
                            </div>
                          )}
                          {zayavka.contract_month && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Muddat: {zayavka.contract_month} oy
                              {zayavka.monthly_pay && ` • Oylik to'lov: ${formatCurrency(zayavka.monthly_pay)}`}
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            ) : null}

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg bg-brand-500 px-6 py-2 font-medium text-white transition-colors hover:bg-brand-600"
              >
                Yopish
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
