import { useState, useMemo, useEffect } from "react";
import Card from "components/card";
import { Search, Plus, Eye, Settings, Clock, Check } from "tabler-icons-react";
import Pagination from "components/pagination";
import CustomSelect from "components/dropdown/CustomSelect";
import { scoringApi, ScoringModel as ApiScoringModel } from "lib/api/scoring";

// Types
type ModelStatus = "active" | "inactive" | "draft";
type ModelCategory = "OFFICIAL" | "CARD_TURNOVER" | "PENSIONER" | "MILITARY";

type ScoringCriteria = {
  id: number;
  name: string;
  weight: number;
  maxScore: number;
};

type CategoryConfig = {
  id?: number;
  category: ModelCategory;
  minAge: number;
  maxAge: number;
  criterias: ScoringCriteria[];
};

type ScoringModel = {
  id: number;
  name: string;
  version: string;
  isActive: boolean;
  categories: CategoryConfig[];
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_LABELS: Record<ModelCategory, string> = {
  OFFICIAL: "Rasmiy ish joyi",
  CARD_TURNOVER: "Karta aylanma",
  PENSIONER: "Pensiyaner",
  MILITARY: "Harbiylar",
};

// Mock Data - will be replaced with API
// const MOCK_SCORING_MODELS: ScoringModel[] = [];

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function ScoringModels() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<ScoringModel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<ScoringModel[]>([]);

  // Load scoring models from API
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await scoringApi.getScoringModels();
      setModels(response.data);
    } catch (error) {
      console.error('Error loading scoring models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create Model Form State
  const [modelName, setModelName] = useState("");
  const [modelVersion, setModelVersion] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ModelCategory[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<Record<ModelCategory, Partial<CategoryConfig>>>({
    OFFICIAL: {},
    CARD_TURNOVER: {},
    PENSIONER: {},
    MILITARY: {},
  });

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.version.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && model.isActive) ||
        (filterStatus === "inactive" && !model.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, filterStatus, models]);

  const totalPages = Math.ceil(filteredModels.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentModels = filteredModels.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const total = models.length;
    const active = models.filter((m) => m.isActive).length;
    const inactive = models.filter((m) => !m.isActive).length;

    return { total, active, inactive, draft: 0 };
  }, [models]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Faol" : "Faol emas";
  };

  const toggleCategory = (category: ModelCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
      // Clear category config when deselected
      setCategoryConfigs({
        ...categoryConfigs,
        [category]: {},
      });
    } else {
      setSelectedCategories([...selectedCategories, category]);
      // Initialize category config with defaults
      setCategoryConfigs({
        ...categoryConfigs,
        [category]: {
          category,
          minAge: 21,
          maxAge: 65,
          criterias: [],
        },
      });
    }
  };

  const updateCategoryConfig = (
    category: ModelCategory,
    field: keyof Omit<CategoryConfig, "category" | "criterias">,
    value: number
  ) => {
    setCategoryConfigs({
      ...categoryConfigs,
      [category]: {
        ...categoryConfigs[category],
        [field]: value,
      },
    });
  };

  const addCriteriaToCategory = (category: ModelCategory) => {
    const config = categoryConfigs[category];
    const newCriteria: ScoringCriteria = {
      id: Date.now(),
      name: "",
      weight: 0,
      maxScore: 0,
    };
    
    setCategoryConfigs({
      ...categoryConfigs,
      [category]: {
        ...config,
        criterias: [...(config.criterias || []), newCriteria],
      },
    });
  };

  const updateCriteria = (
    category: ModelCategory,
    criteriaId: string,
    field: keyof ScoringCriteria,
    value: string | number
  ) => {
    const config = categoryConfigs[category];
    const updatedCriterias = (config.criterias || []).map((c) =>
      c.id === criteriaId ? { ...c, [field]: value } : c
    );

    setCategoryConfigs({
      ...categoryConfigs,
      [category]: {
        ...config,
        criterias: updatedCriterias,
      },
    });
  };

  const removeCriteria = (category: ModelCategory, criteriaId: number) => {
    const config = categoryConfigs[category];
    setCategoryConfigs({
      ...categoryConfigs,
      [category]: {
        ...config,
        criterias: (config.criterias || []).filter((c) => c.id !== criteriaId),
      },
    });
  };

  const getTotalWeight = (category: ModelCategory) => {
    const config = categoryConfigs[category];
    return (config.criterias || []).reduce((sum, c) => sum + (c.weight || 0), 0);
  };

  return (
    <div className="mt-5 h-full w-full">
      <Card extra="w-full pb-10 p-4 h-full">
        {/* Header */}
        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/50">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                Skoring modellari
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kategoriyali skoring modellarini boshqarish
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Yangi model
          </button>
        </header>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Jami modellar</p>
            <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Faol</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Faol emas</p>
            <p className="mt-1 text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Qoralama</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draft}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Model nomi yoki versiya bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-700 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <CustomSelect
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "Barcha holatlar" },
              { value: "active", label: "Faol" },
              { value: "inactive", label: "Faol emas" },
              { value: "draft", label: "Qoralama" },
            ]}
            className="min-w-[180px]"
          />
        </div>

        {/* Models Grid */}
        <div className="mt-6">
          {currentModels.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-500">Ma'lumot topilmadi</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {currentModels.map((model) => (
                <div
                  key={model.id}
                  className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-xl dark:border-gray-700 dark:bg-navy-800"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/50">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white">{model.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{model.version}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadge(model.isActive)}`}>
                      {getStatusText(model.isActive)}
                    </span>
                  </div>

                  {/* Content - flex-grow pushes button down */}
                  <div className="flex-grow space-y-4">
                    {/* Stats Grid */}
                    <div className="space-y-3">
                      {/* Created Date */}
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Yaratilgan sana</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-purple-600 dark:text-purple-400">
                          <Clock className="h-4 w-4" />
                          {formatDate(model.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-700">
                      <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">Kategoriyalar</p>
                      <div className="flex flex-wrap gap-2">
                        {model.categories.map((cat) => (
                          <span
                            key={cat.category}
                            className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          >
                            {CATEGORY_LABELS[cat.category]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Details Button - Always at bottom */}
                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setShowDetailModal(true);
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-600 hover:shadow-lg"
                  >
                    <Eye className="h-4 w-4" />
                    Tafsilotlarni ko'rish
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
            {`${filteredModels.length} dan ${currentModels.length} ta ko'rsatilmoqda`}
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
                { value: "50", label: "50 ta" },
              ]}
              className="min-w-[100px] sm:min-w-[120px]"
            />
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 px-8 py-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-6 top-6 rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Yangi skoring modeli</h3>
                  <p className="mt-1 text-sm text-white/80">Model parametrlarini kiriting</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <div className="space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">Model nomi</label>
                    <input
                      type="text"
                      placeholder="Masalan: Premium Model"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">Versiya</label>
                    <input
                      type="text"
                      placeholder="Masalan: v3.0"
                      value={modelVersion}
                      onChange={(e) => setModelVersion(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Global Parameters */}
                <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white p-4 sm:p-6 dark:border-purple-900/50 dark:from-purple-900/20 dark:to-navy-800">
                  <h5 className="mb-4 flex items-center gap-2 text-base font-bold text-purple-700 dark:text-purple-400">
                    <Settings className="h-5 w-5" />
                    Umumiy parametrlar
                  </h5>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                          Minimal o'tish bali
                        </label>
                        <input
                          type="number"
                          placeholder="300"
                          value={minPassScore}
                          onChange={(e) => setMinPassScore(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                          Minimal limit (so'm)
                        </label>
                        <input
                          type="number"
                          placeholder="1000000"
                          value={globalMinLimit}
                          onChange={(e) => setGlobalMinLimit(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {formatCurrency(globalMinLimit)}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                          Maksimal limit (so'm)
                        </label>
                        <input
                          type="number"
                          placeholder="50000000"
                          value={globalMaxLimit}
                          onChange={(e) => setGlobalMaxLimit(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {formatCurrency(globalMaxLimit)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                        Maksimal ko'rib chiqish vaqti (daqiqa)
                      </label>
                      <input
                        type="number"
                        placeholder="20"
                        value={maxProcessingTime}
                        onChange={(e) => setMaxProcessingTime(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-700 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Barcha kategoriyalar uchun
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="mb-3 block text-base font-bold text-navy-700 dark:text-white">Kategoriyalarni tanlang</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(Object.keys(CATEGORY_LABELS) as ModelCategory[]).map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                          selectedCategories.includes(category)
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                            : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 dark:border-gray-700 dark:bg-navy-800 dark:text-gray-300"
                        }`}
                      >
                        {selectedCategories.includes(category) && <Check className="h-4 w-4" />}
                        {CATEGORY_LABELS[category]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Forms */}
                {selectedCategories.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-navy-700 dark:text-white">Kategoriya sozlamalari</h4>
                    {selectedCategories.map((category) => (
                      <div
                        key={category}
                        className="rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4 sm:p-5 dark:border-brand-900/50 dark:from-brand-900/20 dark:to-navy-800"
                      >
                        <h5 className="mb-4 flex items-center gap-2 font-bold text-brand-700 dark:text-brand-400">
                          <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                          {CATEGORY_LABELS[category]}
                        </h5>

                        <div className="space-y-4">
                          {/* Age Limits - For All Categories */}
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                            <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-400">Yosh chegaralari</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-navy-700 dark:text-white">Min yosh</label>
                                <input
                                  type="number"
                                  placeholder="21"
                                  value={categoryConfigs[category]?.minAge || ""}
                                  onChange={(e) => updateCategoryConfig(category, "minAge", Number(e.target.value))}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-700 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-navy-700 dark:text-white">Max yosh</label>
                                <input
                                  type="number"
                                  placeholder="65"
                                  value={categoryConfigs[category]?.maxAge || ""}
                                  onChange={(e) => updateCategoryConfig(category, "maxAge", Number(e.target.value))}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none transition-colors focus:border-brand-500 dark:border-gray-700 dark:bg-navy-700 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Criterias Section */}
                          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-700">
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <h6 className="text-sm font-bold text-navy-700 dark:text-white">Baholash mezonlari</h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Jami og'irlik: {getTotalWeight(category)}%
                                  {getTotalWeight(category) !== 100 && (
                                    <span className="ml-2 text-red-600 dark:text-red-400">(100% bo'lishi kerak)</span>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={() => addCriteriaToCategory(category)}
                                className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
                              >
                                <Plus className="h-3 w-3" />
                                Qo'shish
                              </button>
                            </div>

                            {categoryConfigs[category]?.criterias && categoryConfigs[category].criterias!.length > 0 ? (
                              <div className="space-y-2">
                                {categoryConfigs[category].criterias!.map((criteria, index) => (
                                  <div key={criteria.id} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-900/50">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <input
                                        type="text"
                                        placeholder="Mezon nomi"
                                        value={criteria.name}
                                        onChange={(e) => updateCriteria(category, criteria.id, "name", e.target.value)}
                                        className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          type="number"
                                          placeholder="Og'irlik %"
                                          value={criteria.weight || ""}
                                          onChange={(e) => updateCriteria(category, criteria.id, "weight", Number(e.target.value))}
                                          className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
                                        />
                                        <input
                                          type="number"
                                          placeholder="Max ball"
                                          value={criteria.maxScore || ""}
                                          onChange={(e) => updateCriteria(category, criteria.id, "maxScore", Number(e.target.value))}
                                          className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeCriteria(category, criteria.id)}
                                      className="mt-1 flex h-6 w-6 items-center justify-center rounded bg-red-500 text-white transition-colors hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="py-4 text-center text-xs text-gray-500">Mezon qo'shilmagan</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-gray-600 hover:to-gray-700"
                >
                  Bekor qilish
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-brand-600 hover:to-brand-700">
                  <Check className="h-5 w-5" />
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 px-8 py-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedModel(null);
                }}
                className="absolute right-6 top-6 z-10 rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center justify-between pr-12">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedModel.name}</h3>
                    <p className="mt-1 text-sm text-white/80">{selectedModel.version} - {getStatusText(selectedModel.isActive)}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs text-white/70">Yaratilgan</p>
                  <p className="text-sm font-bold text-white">{formatDate(selectedModel.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Updated Date */}
                <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white p-4 dark:border-blue-900/50 dark:from-blue-900/20 dark:to-navy-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Oxirgi yangilanish</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatDate(selectedModel.updatedAt)}</p>
                  </div>
                </div>

                {/* Categories Details */}
                <div>
                  <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Kategoriyalar ({selectedModel.categories.length})</h4>
                  <div className="space-y-4">
                    {selectedModel.categories.map((categoryConfig, idx) => (
                      <div
                        key={categoryConfig.category}
                        className="rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5 dark:border-brand-900/50 dark:from-brand-900/20 dark:to-navy-800"
                      >
                        <h5 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-700 dark:text-brand-400">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                            {idx + 1}
                          </div>
                          {CATEGORY_LABELS[categoryConfig.category]}
                        </h5>

                        {/* Category Parameters */}
                        <div className="mb-4 grid grid-cols-2 gap-3">
                          {categoryConfig.minAge && categoryConfig.maxAge && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                              <p className="text-xs text-amber-800 dark:text-amber-400">Yosh chegaralari</p>
                              <p className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-400">
                                {categoryConfig.minAge}-{categoryConfig.maxAge}
                              </p>
                            </div>
                          )}
                          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-navy-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Mezonlar soni</p>
                            <p className="mt-1 text-sm font-bold text-navy-700 dark:text-white">{categoryConfig.criterias.length}</p>
                          </div>
                        </div>

                        {/* Criterias */}
                        {categoryConfig.criterias.length > 0 && (
                          <div>
                            <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">
                              Mezonlar ({categoryConfig.criterias.length})
                            </p>
                            <div className="space-y-2">
                              {categoryConfig.criterias.map((criteria, cIdx) => (
                                <div
                                  key={criteria.id}
                                  className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-navy-700"
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                                        {cIdx + 1}
                                      </span>
                                      <span className="text-sm font-bold text-navy-700 dark:text-white">{criteria.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{criteria.weight}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600"
                                        style={{ width: `${criteria.weight}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Max: {criteria.maxScore}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                {selectedModel.totalApplications !== undefined && (
                  <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 dark:border-indigo-900/50 dark:from-indigo-900/20 dark:to-navy-800">
                    <h4 className="mb-4 text-base font-bold text-indigo-700 dark:text-indigo-400">Statistika</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Jami arizalar</p>
                        <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
                          {selectedModel.totalApplications.toLocaleString()}
                        </p>
                      </div>
                      {selectedModel.successRate !== undefined && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Muvaffaqiyat</p>
                          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{selectedModel.successRate}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedModel(null);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-gray-600 hover:to-gray-700"
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
