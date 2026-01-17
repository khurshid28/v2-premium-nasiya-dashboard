import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Card from "components/card";
import { Search, User, FileText, CircleCheck, Phone, Calendar, MapPin } from "tabler-icons-react";
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
};

export default function CustomersWithApi() {
  const location = useLocation();
  const api = useMemo(() => {
    const isDemoMode = location.pathname.startsWith('/demo');
    return isDemoMode ? demoApi : apiReal;
  }, [location.pathname]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, [currentPage, api]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.listCustomers({
        page: currentPage,
        pageSize,
      });
      
      if (response && response.value) {
        setCustomers(response.value);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    customers.forEach(customer => {
      if (customer.region) {
        uniqueRegions.add(customer.region);
      }
    });
    return Array.from(uniqueRegions).sort();
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          customer.fullName.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower) ||
          customer.passport?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Region filter
      if (selectedRegion !== "all" && customer.region !== selectedRegion) {
        return false;
      }

      return true;
    });
  }, [customers, searchQuery, selectedRegion]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalCustomers: filteredCustomers.length,
      activeApplications: filteredCustomers.reduce((sum, c) => sum + c.activeApplications, 0),
      completedApplications: filteredCustomers.reduce((sum, c) => sum + c.completedApplications, 0),
      rejectedApplications: filteredCustomers.reduce((sum, c) => sum + c.rejectedApplications, 0),
    };
  }, [filteredCustomers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString("uz-UZ");
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
            {filteredCustomers.map((customer, index) => (
              <tr 
                key={customer.id}
                className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-800"
              >
                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                      {customer.fullName.charAt(0).toUpperCase()}
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

        {filteredCustomers.length === 0 && (
          <div className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Mijozlar topilmadi
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
        <div className="mt-6">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </Card>
  );
}
