import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "components/card";
import { Search, User, FileText, CircleCheck, Phone, Calendar, MapPin, Plus, Edit, Trash, X, BuildingStore } from "tabler-icons-react";
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

type CustomerFormData = {
  full_name: string;
  phone: string;
  passport: string;
  birth_date: string;
  address: string;
  region: string;
};

export default function CustomersAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const api = useMemo(() => {
    const isDemoMode = location.pathname.startsWith('/demo');
    return isDemoMode ? demoApi : apiReal;
  }, [location.pathname]);

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    full_name: '',
    phone: '',
    passport: '',
    birth_date: '',
    address: '',
    region: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerFormData>>({});

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Load ALL customers once
  useEffect(() => {
    loadCustomers();
  }, [api]);

  // Reset to page 1 when search or region changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      console.log('🔵 Loading customers...');
      
      const response = await api.listCustomers({
        page: 1,
        pageSize: 1000,
      });
      
      console.log('✅ API Response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response.value exists?', !!response?.value);
      console.log('✅ First customer:', response?.value?.[0]);
      
      if (response && response.value) {
        console.log('✅ Total customers:', response.value.length);
        // Sort by ID descending (newest first)
        const sortedCustomers = response.value.sort((a, b) => b.id - a.id);
        setAllCustomers(sortedCustomers);
      } else {
        console.error('❌ Invalid response structure:', response);
      }
    } catch (error: any) {
      console.error('❌ Error loading customers:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.status);
      showToast(error.message || "Ma'lumotlarni yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Get unique regions from ALL customers
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    allCustomers.forEach(customer => {
      if (customer.region) {
        uniqueRegions.add(customer.region);
      }
    });
    return Array.from(uniqueRegions).sort();
  }, [allCustomers]);

  // Filter customers from ALL customers
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(customer => {
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          customer.fullName.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower) ||
          customer.passport?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      if (selectedRegion !== "all" && customer.region !== selectedRegion) {
        return false;
      }

      return true;
    });
  }, [allCustomers, searchQuery, selectedRegion]);

  // Paginate filtered customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCustomers.length / pageSize);
  }, [filteredCustomers.length, pageSize]);

  // Calculate stats from ALL customers
  const stats = useMemo(() => {
    return {
      totalCustomers: allCustomers.length,
      activeApplications: allCustomers.reduce((sum, c) => sum + c.activeApplications, 0),
      completedApplications: allCustomers.reduce((sum, c) => sum + c.completedApplications, 0),
      rejectedApplications: allCustomers.reduce((sum, c) => sum + c.rejectedApplications, 0),
    };
  }, [allCustomers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString("uz-UZ");
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<CustomerFormData> = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = "To'liq ism majburiy";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Telefon raqam majburiy";
    } else if (!/^\+998\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)";
    }
    
    if (!formData.passport.trim()) {
      errors.passport = "Passport majburiy";
    } else if (!/^[A-Z]{2}\d{7}$/.test(formData.passport)) {
      errors.passport = "Passport noto'g'ri formatda (XX1234567)";
    }
    
    if (!formData.birth_date) {
      errors.birth_date = "Tug'ilgan sana majburiy";
    }
    
    if (!formData.address.trim()) {
      errors.address = "Manzil majburiy";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      full_name: '',
      phone: '',
      passport: '',
      birth_date: '',
      address: '',
      region: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedCustomerDetail(null);
    setShowDetailModal(true);
    setLoadingDetail(true);
    
    try {
      const detail = await api.getCustomer(customer.id);
      setSelectedCustomerDetail(detail);
    } catch (error) {
      console.error('Error loading customer detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setModalMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.fullName,
      phone: customer.phone,
      passport: customer.passport,
      birth_date: customer.birthDate,
      address: customer.address,
      region: customer.region || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`${customer.fullName} mijozni o'chirishni xohlaysizmi?`)) {
      return;
    }

    try {
      await api.deleteCustomer(customer.id);
      showToast("Mijoz muvaffaqiyatli o'chirildi", 'success');
      loadCustomers();
    } catch (error: any) {
      showToast(error.message || "Mijozni o'chirishda xatolik", 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.createCustomer(formData);
        showToast("Mijoz muvaffaqiyatli qo'shildi", 'success');
      } else {
        await api.updateCustomer(selectedCustomer!.id, formData);
        showToast("Mijoz muvaffaqiyatli yangilandi", 'success');
      }
      
      setShowModal(false);
      loadCustomers();
    } catch (error: any) {
      showToast(error.message || "Xatolik yuz berdi", 'error');
    }
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
    <>
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
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" />
              Yangi mijoz
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
                  Hudud
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Arizalar
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Qarzdorlik
                </th>
                <th className="pb-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer, index) => (
                <tr 
                  key={customer.id}
                  onClick={() => handleViewCustomer(customer)}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-800 cursor-pointer"
                >
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 text-sm font-bold">
                        {customer.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-medium text-navy-700 dark:text-white">{customer.fullName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{customer.passport}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {customer.region || '—'}
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {customer.activeApplications} faol
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {customer.completedApplications} tugagan
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
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
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                        className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
                        title="Tahrirlash"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-navy-800">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                {modalMode === 'create' ? "Yangi mijoz qo'shish" : "Mijozni tahrirlash"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  To'liq ism <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  placeholder="Ism Familiya"
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.full_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                    placeholder="+998901234567"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                    Passport <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.passport}
                    onChange={(e) => setFormData({ ...formData, passport: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                    placeholder="AA1234567"
                    maxLength={9}
                  />
                  {formErrors.passport && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.passport}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Tug'ilgan sana <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                />
                {formErrors.birth_date && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.birth_date}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Manzil <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-900 dark:text-white"
                  placeholder="To'liq manzil"
                  rows={3}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-700 dark:text-white">
                  Hudud
                </label>
                <CustomSelect
                  value={formData.region || ""}
                  onChange={(value) => setFormData({ ...formData, region: value })}
                  options={[
                    { value: "", label: "Hudud tanlang" },
                    ...regions.map(r => ({ value: r, label: r }))
                  ]}
                />
                {formErrors.region && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.region}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-navy-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  {modalMode === 'create' ? "Qo'shish" : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white dark:bg-navy-800 shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-navy-800">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Mijoz ma'lumotlari
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
                </div>
              ) : selectedCustomerDetail ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">F.I.O</p>
                      <p className="font-medium text-navy-700 dark:text-white">{selectedCustomerDetail.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                      <p className="font-medium text-navy-700 dark:text-white">{selectedCustomerDetail.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Passport</p>
                      <p className="font-medium text-navy-700 dark:text-white">{selectedCustomerDetail.passport}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tug'ilgan sana</p>
                      <p className="font-medium text-navy-700 dark:text-white">{selectedCustomerDetail.birth_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hudud</p>
                      <p className="font-medium text-navy-700 dark:text-white">{selectedCustomerDetail.region || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manzil</p>
                      <p className="font-medium text-navy-700 dark:text-white">{selectedCustomerDetail.address}</p>
                    </div>
                  </div>

                  {/* MyID Section */}
                  {selectedCustomerDetail?.myid?.profile && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <h4 className="mb-3 font-bold text-navy-700 dark:text-white">MyID ma'lumotlari</h4>
                      <div className="grid grid-cols-2 gap-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-navy-900 dark:to-indigo-900/20">
                        {/* PINFL */}
                        {selectedCustomerDetail.myid.profile.common_data?.pinfl && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">PINFL</p>
                            <p className="mt-1 text-sm font-mono font-semibold text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.pinfl}
                            </p>
                          </div>
                        )}
                        
                        {/* Tug'ilgan sana */}
                        {selectedCustomerDetail.myid.profile.common_data?.birth_date && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tug'ilgan sana</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.birth_date}
                            </p>
                          </div>
                        )}
                        
                        {/* Tug'ilgan joy */}
                        {selectedCustomerDetail.myid.profile.common_data?.birth_place && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tug'ilgan joy</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.birth_place}
                            </p>
                          </div>
                        )}
                        
                        {/* Jinsi */}
                        {selectedCustomerDetail.myid.profile.common_data?.gender && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Jinsi</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.gender === '1' ? 'Erkak' : 'Ayol'}
                            </p>
                          </div>
                        )}
                        
                        {/* Millati */}
                        {selectedCustomerDetail.myid.profile.common_data?.nationality && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Millati</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.nationality}
                            </p>
                          </div>
                        )}
                        
                        {/* Fuqaroligi */}
                        {selectedCustomerDetail.myid.profile.common_data?.citizenship && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fuqaroligi</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.common_data.citizenship}
                            </p>
                          </div>
                        )}
                        
                        {/* Passport berilgan sana */}
                        {selectedCustomerDetail.myid.profile.doc_data?.issued_date && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Berilgan sana</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.doc_data.issued_date}
                            </p>
                          </div>
                        )}
                        
                        {/* Amal qilish muddati */}
                        {selectedCustomerDetail.myid.profile.doc_data?.expiry_date && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Amal qilish muddati</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.doc_data.expiry_date}
                            </p>
                          </div>
                        )}
                        
                        {/* Kim tomonidan berilgan */}
                        {selectedCustomerDetail.myid.profile.doc_data?.issued_by && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Kim tomonidan berilgan</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.doc_data.issued_by}
                            </p>
                          </div>
                        )}
                        
                        {/* Doimiy manzil */}
                        {selectedCustomerDetail.myid.profile.address?.permanent_registration?.full_address && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Doimiy manzil</p>
                            <p className="mt-1 text-sm font-medium text-navy-700 dark:text-white">
                              {selectedCustomerDetail.myid.profile.address.permanent_registration.full_address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
                                      {cw.start_date && new Date(cw.start_date).toLocaleDateString('uz-UZ')}
                                      {cw.end_date ? ` - ${new Date(cw.end_date).toLocaleDateString('uz-UZ')}` : ' - hozir'}
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

                  {/* Applications List */}
                  {selectedCustomerDetail.zayavkalar && selectedCustomerDetail.zayavkalar.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <h4 className="mb-3 font-bold text-navy-700 dark:text-white">
                        Arizalari ({selectedCustomerDetail.zayavkalar.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedCustomerDetail.zayavkalar.map((app: any) => (
                          <div 
                            key={app.id} 
                            onClick={() => {
                              setShowDetailModal(false);
                              const prefix = location.pathname.startsWith('/demo') ? '/demo' : location.pathname.startsWith('/super') ? '/super' : '/admin';
                              navigate(`${prefix}/applications?passport=${selectedCustomerDetail.passport}`);
                            }}
                            className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-brand-500 hover:shadow-md dark:border-gray-700 dark:bg-navy-700 dark:hover:border-brand-400"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-medium text-navy-700 dark:text-white">
                                Ariza #{app.id}
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                app.status === 'CONFIRMED' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : app.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : app.status === 'CREATED'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : app.status === 'CANCELLED_BY_SCORING'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                  : (app.status?.includes('FINISHED') || app.status === 'COMPLETED' || app.status === 'ACTIVE')
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : (app.status?.includes('CANCELED') || app.status?.includes('RAD'))
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : app.status?.includes('LIMIT')
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {app.status === 'CONFIRMED' ? 'Tasdiqlangan' 
                                  : app.status === 'REJECTED' ? 'Rad etilgan'
                                  : app.status === 'CREATED' ? 'Yaratilgan'
                                  : app.status === 'CANCELLED_BY_SCORING' ? 'Skoring rad etdi'
                                  : app.status === 'FINISHED' || app.status === 'COMPLETED' || app.status === 'ACTIVE' ? 'Tugatilgan'
                                  : app.status?.includes('CANCELED') || app.status?.includes('RAD') ? 'Rad etilgan'
                                  : app.status?.includes('LIMIT') ? 'Limit'
                                  : app.status?.includes('PENDING') ? 'Kutilmoqda'
                                  : app.status || 'Kutilmoqda'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Summa:</span>
                                <span className="ml-2 font-medium text-navy-700 dark:text-white">
                                  {app.amount && app.amount > 0 ? `${app.amount.toLocaleString('uz-UZ')} so'm` : '—'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Muddat:</span>
                                <span className="ml-2 font-medium text-navy-700 dark:text-white">
                                  {app.expired_month ? `${app.expired_month} oy` : '—'}
                                </span>
                              </div>
                              {app.merchant && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Merchant:</span>
                                  <span className="ml-2 font-medium text-navy-700 dark:text-white">
                                    {app.merchant.name}
                                  </span>
                                </div>
                              )}
                              {app.fillial && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Filial:</span>
                                  <span className="ml-2 font-medium text-navy-700 dark:text-white">
                                    {app.fillial.name}
                                  </span>
                                </div>
                              )}
                              <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">Sana:</span>
                                <span className="ml-2 font-medium text-navy-700 dark:text-white">
                                  {new Date(app.createdAt).toLocaleDateString('uz-UZ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCustomerDetail.zayavkalar && selectedCustomerDetail.zayavkalar.length === 0 && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <p className="text-center text-gray-500 dark:text-gray-400">
                        Hozircha arizalar yo'q
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500">Ma'lumot yuklanmadi</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className={`rounded-lg px-6 py-4 shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
