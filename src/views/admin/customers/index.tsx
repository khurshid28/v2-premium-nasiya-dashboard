import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Card from "components/card";
import { Search, User, FileText, CircleCheck, Phone, Calendar, MapPin, Plus, Edit, Trash, X } from "tabler-icons-react";
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
};

export default function CustomersAdmin() {
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
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    full_name: '',
    phone: '',
    passport: '',
    birth_date: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerFormData>>({});

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

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
    } catch (error: any) {
      showToast(error.message || "Ma'lumotlarni yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
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
      address: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setModalMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      full_name: customer.fullName,
      phone: customer.phone,
      passport: customer.passport,
      birth_date: customer.birthDate,
      address: customer.address
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
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr 
                  key={customer.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-800"
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
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
                        title="Tahrirlash"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                        title="O'chirish"
                      >
                        <Trash className="h-4 w-4" />
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
