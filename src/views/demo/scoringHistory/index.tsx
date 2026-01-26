import { useState, useEffect } from "react";
import Card from "components/card";
import { Clock, Search, CircleCheck, CircleX, Activity, User, TrendingUp, Calendar, Bolt, Award, Download } from "tabler-icons-react";
import Pagination from "components/pagination";
import CustomSelect from "components/dropdown/CustomSelect";
import DateRangePicker from "components/DateRangePicker";
import { scoringHistoryApi, ScoringHistoryItem } from "lib/api/scoringHistory";
import Toast from "components/toast/ToastNew";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const formatName = (name: string) => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle words with apostrophes like O'tkir
      if (word.includes("'")) {
        return word.split("'").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join("'");
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const getCategoryName = (category: string) => {
  const categories: { [key: string]: string } = {
    OFFICIAL: "Rasmiy ish joyi",
    INDIVIDUAL: "Yakka tartibdagi tadbirkor",
    UNEMPLOYED: "Ishsiz",
    SELF_EMPLOYED: "Mustaqil faoliyat",
    RETIRED: "Pensioner",
  };
  return categories[category] || category;
};

const exportToExcel = (data: ScoringHistoryItem[]) => {
  // Create CSV content with criteria scores
  const headers = [
    "ID",
    "Mijoz",
    "Telefon",
    "Model",
    "Kategoriya",
    "Ball",
    "Min ball",
    "Natija",
    "Manba",
    "Davomiyligi",
    "Baholangan vaqti",
    "Kriteriyalar ballari"
  ];
  
  const rows = data.map(item => {
    // Format criteria scores as "Criteria1: 80/100, Criteria2: 90/100"
    let criteriaScoresText = "";
    if (item.criteria_scores && Object.keys(item.criteria_scores).length > 0) {
      criteriaScoresText = Object.entries(item.criteria_scores).map(([key, scoreData], index) => {
        let criteriaName = key;
        let criteria;
        
        // Map criteria_1, criteria_2 to actual criteria names
        if (key.startsWith('criteria_')) {
          const criteriaIndex = parseInt(key.split('_')[1]) - 1;
          criteria = item.scoringCategory.criterias?.[criteriaIndex];
          criteriaName = criteria?.name || key;
        } else {
          criteria = item.scoringCategory.criterias?.find((c: any) => c.name === key);
        }
        
        const actualScore = typeof scoreData === 'object' && scoreData !== null 
          ? (scoreData as any).score || (scoreData as any).value || 0
          : (scoreData as number);
        const maxScore = criteria?.maxScore || 100;
        return `${criteriaName}: ${actualScore}/${maxScore}`;
      }).join(", ");
    }
    
    return [
      item.id,
      formatName(item.zayavka.fullname),
      item.zayavka.phone || "",
      item.scoringModel.name,
      getCategoryName(item.scoringCategory.category),
      item.total_score,
      item.scoringModel.minPassScore,
      item.passed ? "Muvaffaqiyatli" : "Rad etilgan",
      item.source,
      formatDuration(item.processing_time_seconds),
      formatDate(item.evaluated_at),
      criteriaScoresText
    ];
  });
  
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
  link.setAttribute("download", `skoring-tarixi-${today}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ScoringHistory() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScoringHistoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterPassed, setFilterPassed] = useState("all");
  const [filterModel, setFilterModel] = useState("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedItem, setSelectedItem] = useState<ScoringHistoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await scoringHistoryApi.getScoringHistory();
      setHistory(response.data.data || []);
    } catch (error: any) {
      console.error('Error loading scoring history:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || "Ma'lumotlarni yuklashda xatolik",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await scoringHistoryApi.getScoringHistoryStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Get unique models for filter from all history
  const uniqueModels = Array.from(new Set(history.map(item => item.scoringModel.name)));

  // Filter data
  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.zayavka.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.zayavka.phone?.includes(searchQuery) ||
      item.id.toString().includes(searchQuery);

    const matchesSource = filterSource === "all" || item.source === filterSource;
    
    // Check if passed based on score comparison
    const isPassed = item.total_score >= item.scoringModel.minPassScore;
    const matchesPassed = 
      filterPassed === "all" || 
      (filterPassed === "passed" && isPassed) ||
      (filterPassed === "failed" && !isPassed);
    const matchesModel = filterModel === "all" || item.scoringModel.name === filterModel;
    
    // Date range filter
    if (startDate || endDate) {
      const itemDate = new Date(item.evaluated_at);
      if (startDate) {
        const start = new Date(startDate);
        if (itemDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
    }

    return matchesSearch && matchesSource && matchesPassed && matchesModel;
  });

  // Calculate statistics from filtered data
  const filteredStats = {
    total: filteredHistory.length,
    passed: filteredHistory.filter(item => item.total_score >= item.scoringModel.minPassScore).length,
    failed: filteredHistory.filter(item => item.total_score < item.scoringModel.minPassScore).length,
    avgScore: filteredHistory.length > 0 
      ? filteredHistory.reduce((sum, item) => sum + item.total_score, 0) / filteredHistory.length 
      : 0,
    avgProcessingTime: filteredHistory.length > 0
      ? filteredHistory.reduce((sum, item) => sum + item.processing_time_seconds, 0) / filteredHistory.length
      : 0,
  };

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = filteredHistory.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (passed: boolean) => {
    return passed
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getSourceBadge = (source: string) => {
    const badges: { [key: string]: string } = {
      mobile: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      web: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      api: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return badges[source] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <div className="mt-5 h-full w-full">
      <Card extra="w-full pb-10 p-4 h-full">
        {/* Header */}
        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/50">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                Skoring tarixi
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Barcha skoring baholash natijalari
              </p>
            </div>
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => exportToExcel(filteredHistory)}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 active:scale-95"
          >
            <Download size={18} />
            Excel yuklash
          </button>
        </header>

        {/* Statistics */}
        {history.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 p-5 shadow-lg transition-all hover:shadow-xl">
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-white/10"></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Jami</p>
              <p className="mt-2 text-3xl font-bold text-white">{filteredStats.total}</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 shadow-lg shadow-green-500/30 transition-all hover:shadow-xl">
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-white/10"></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Muvaffaqiyatli</p>
              <p className="mt-2 text-3xl font-bold text-white">{filteredStats.passed}</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 shadow-lg shadow-red-500/30 transition-all hover:shadow-xl">
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-white/10"></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Rad etilgan</p>
              <p className="mt-2 text-3xl font-bold text-white">{filteredStats.failed}</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl">
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-white/10"></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">O'rtacha ball</p>
              <p className="mt-2 text-3xl font-bold text-white">{Math.round(filteredStats.avgScore)}</p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl">
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-white/10"></div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">O'rtacha vaqt</p>
              <p className="mt-2 text-3xl font-bold text-white">{formatDuration(Math.round(filteredStats.avgProcessingTime))}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 space-y-3">
          {/* Date Filter Row */}
          <div>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={(date) => {
                setStartDate(date);
                setCurrentPage(1);
              }}
              onEndChange={(date) => {
                setEndDate(date);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Search and Dropdown Filters Row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative lg:w-120">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ID, Mijoz yoki telefon..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-700 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <CustomSelect
              value={filterSource}
              onChange={(value) => {
                setFilterSource(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha manbalar" },
                { value: "mobile", label: "Mobile" },
                { value: "web", label: "Web" },
                { value: "api", label: "API" },
              ]}
              className="min-w-[160px] flex-1 sm:flex-none"
            />

            <CustomSelect
              value={filterPassed}
              onChange={(value) => {
                setFilterPassed(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha natijalar" },
                { value: "passed", label: "Muvaffaqiyatli" },
                { value: "failed", label: "Rad etilgan" },
              ]}
              className="min-w-[160px] flex-1 sm:flex-none"
            />

            <CustomSelect
              value={filterModel}
              onChange={(value) => {
                setFilterModel(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha modellar" },
                ...uniqueModels.map(model => ({ value: model, label: model }))
              ]}
              className="min-w-[160px] flex-1 sm:flex-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-navy-800">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-500">Ma'lumot topilmadi</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-navy-700">
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Mijoz
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      Model
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Ball
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <CircleCheck className="h-3.5 w-3.5" />
                      Natija
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">Limit / Sabab</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <Bolt className="h-3.5 w-3.5" />
                      Manba
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Vaqt
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Sana
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailModal(true);
                    }}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-navy-700"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">#{item.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-navy-700 dark:text-white">{formatName(item.zayavka.fullname)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{item.zayavka.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-navy-700 dark:text-white">{item.scoringModel.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.scoringModel.version}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-navy-700 dark:text-white">{item.total_score}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">ball</span>
                        </div>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              item.passed 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${Math.min((item.total_score / 500) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadge(item.passed)}`}>
                        {item.passed ? (
                          <>
                            <CircleCheck className="h-3 w-3" />
                            O'tdi
                          </>
                        ) : (
                          <>
                            <CircleX className="h-3 w-3" />
                            Rad
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.passed ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {item.zayavka.limit ? item.zayavka.limit.toLocaleString() + ' so\'m' : '—'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Berilgan limit</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">Rad qilindi</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Ball yetarli emas</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${getSourceBadge(item.source)}`}>
                        <Bolt className="h-3 w-3" />
                        {item.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(item.processing_time_seconds)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(item.evaluated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
            {`${filteredHistory.length} dan ${currentItems.length} ta ko'rsatilmoqda`}
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
                { value: "20", label: "20 ta" },
                { value: "50", label: "50 ta" },
                { value: "100", label: "100 ta" },
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
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Header */}
            <div className="sticky top-0 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 dark:border-gray-700">
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute right-6 top-6 rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Skoring tafsilotlari</h3>
                  <p className="mt-1 text-sm text-white/80">ID: #{selectedItem.id}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Mijoz ma'lumotlari */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700">
                <h4 className="mb-3 text-sm font-bold text-navy-700 dark:text-white">Mijoz ma'lumotlari</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">F.I.O</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selectedItem.zayavka.fullname}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Telefon</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selectedItem.zayavka.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Berilgan limit</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {selectedItem.zayavka.limit ? selectedItem.zayavka.limit.toLocaleString() + ' so\'m' : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skoring natijalari */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700">
                <h4 className="mb-3 text-sm font-bold text-navy-700 dark:text-white">Skoring natijalari</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Model</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {selectedItem.scoringModel.name} ({selectedItem.scoringModel.version})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Kategoriya</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{getCategoryName(selectedItem.scoringCategory.category)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Jami ball</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {selectedItem.total_score} ball
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Minimal ball</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selectedItem.scoringModel.minPassScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Natija</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      selectedItem.total_score >= selectedItem.scoringModel.minPassScore
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedItem.total_score >= selectedItem.scoringModel.minPassScore ? (
                        <>
                          <CircleCheck className="h-3 w-3" />
                          O'tdi
                        </>
                      ) : (
                        <>
                          <CircleX className="h-3 w-3" />
                          Rad etilgan
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Manba</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getSourceBadge(selectedItem.source)}`}>
                      {selectedItem.source}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Score Summary */}
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-4 dark:border-indigo-900/50 dark:from-indigo-900/20 dark:to-navy-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Kriteriyalar bo'yicha ball</p>
                    <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">
                      {selectedItem.category_base_score || 0}
                    </p>
                  </div>
                  {selectedItem.age !== undefined && selectedItem.age_score !== undefined && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Yosh ({selectedItem.age} yosh)</p>
                      <p className={`mt-1 text-2xl font-bold ${selectedItem.age_score < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {selectedItem.age_score > 0 ? '+' : ''}{selectedItem.age_score}
                      </p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Jami ball</p>
                    <p className="mt-1 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedItem.total_score}
                    </p>
                  </div>
                </div>
              </div>

              {/* Criteria Scores - Kriteriyalar bo'yicha balllar */}
              {selectedItem.criteria_scores && Object.keys(selectedItem.criteria_scores).length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-700 dark:text-white">
                    <Award className="h-4 w-4 text-indigo-600" />
                    Kriteriyalar bo'yicha balllar
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedItem.criteria_scores).map(([criteriaKey, scoreData], index) => {
                      // Map criteria_1, criteria_2, or criteria_62 to actual criteria
                      let criteria;
                      let criteriaName = criteriaKey;
                      
                      // If key is like "criteria_1" or "criteria_62", extract ID and find by ID
                      if (criteriaKey.startsWith('criteria_')) {
                        const criteriaId = parseInt(criteriaKey.split('_')[1]);
                        
                        // First try to find by ID
                        criteria = selectedItem.scoringCategory.criterias?.find(
                          (c: any) => c.id === criteriaId
                        );
                        
                        // If not found by ID, try by index (for backwards compatibility)
                        if (!criteria) {
                          const criteriaIndex = criteriaId - 1;
                          criteria = selectedItem.scoringCategory.criterias?.[criteriaIndex];
                        }
                        
                        criteriaName = criteria?.name || criteriaKey;
                      } else {
                        // Find by name
                        criteria = selectedItem.scoringCategory.criterias?.find(
                          (c: any) => c.name === criteriaKey
                        );
                      }
                      
                      // Extract actual score value
                      const actualScore = typeof scoreData === 'object' && scoreData !== null 
                        ? (scoreData as any).score || (scoreData as any).value || 0
                        : (scoreData as number);
                      
                      const maxScore = criteria?.maxScore || 100;
                      const percentage = (actualScore / maxScore) * 100;
                      
                      return (
                        <div key={criteriaKey} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-navy-700 dark:text-white">
                              {criteriaName}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {actualScore}/{maxScore} ball
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage >= 80
                                  ? "bg-green-500"
                                  : percentage >= 60
                                  ? "bg-blue-500"
                                  : percentage >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vaqt ma'lumotlari */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-700">
                <h4 className="mb-3 text-sm font-bold text-navy-700 dark:text-white">Vaqt ma'lumotlari</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Boshlangan</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{formatDate(selectedItem.scoring_start)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tugagan</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{formatDate(selectedItem.scoring_end)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Davomiyligi</p>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {formatDuration(selectedItem.processing_time_seconds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Baholangan</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{formatDate(selectedItem.evaluated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </div>
  );
}
