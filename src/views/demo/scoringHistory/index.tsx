import { useState, useMemo } from "react";
import Card from "components/card";
import { Search, ChartBar, Calendar, User, DeviceMobile, Phone, Filter } from "tabler-icons-react";
import Pagination from "components/pagination";
import CustomSelect from "components/dropdown/CustomSelect";
import DateRangePicker from "components/DateRangePicker";

// Types
type ScoringResult = "approved" | "rejected";
type ApplicationSource = "client_mobile" | "operator";

type ScoringRecord = {
  id: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  passport: string;
  scoringDate: string;
  result: ScoringResult;
  scoringScore: number;
  scoringModel: string;
  limitAmount?: number;
  rejectionReason?: string;
  source: ApplicationSource;
  operatorName?: string;
  fillialName?: string;
  region: string;
  waitingTime: number; // in minutes
};

// Mock Data - Combined from all customers
const MOCK_SCORING_RECORDS: ScoringRecord[] = [
  {
    id: "SCR001",
    customerId: 1,
    customerName: "Abdullayev Jasur",
    customerPhone: "+998901234567",
    passport: "AA1234567",
    scoringDate: "2024-11-01",
    result: "approved",
    scoringScore: 420,
    scoringModel: "Premium Model v2.1",
    limitAmount: 15000000,
    source: "client_mobile",
    region: "Toshkent",
    waitingTime: 2,
  },
  {
    id: "SCR002",
    customerId: 1,
    customerName: "Abdullayev Jasur",
    customerPhone: "+998901234567",
    passport: "AA1234567",
    scoringDate: "2024-10-15",
    result: "approved",
    scoringScore: 350,
    scoringModel: "Premium Model v2.0",
    limitAmount: 10000000,
    source: "operator",
    operatorName: "Karimov Shavkat",
    fillialName: "Chilonzor filiali",
    region: "Toshkent",
    waitingTime: 1.5,
  },
  {
    id: "SCR003",
    customerId: 1,
    customerName: "Abdullayev Jasur",
    customerPhone: "+998901234567",
    passport: "AA1234567",
    scoringDate: "2024-08-20",
    result: "rejected",
    scoringScore: 180,
    scoringModel: "Premium Model v1.5",
    rejectionReason: "Yomon kredit tarixi",
    source: "client_mobile",
    region: "Toshkent",
    waitingTime: 18,
  },
  {
    id: "SCR004",
    customerId: 2,
    customerName: "Karimova Nilufar",
    customerPhone: "+998902345678",
    passport: "AB2345678",
    scoringDate: "2024-11-10",
    result: "approved",
    scoringScore: 385,
    scoringModel: "Premium Model v2.1",
    limitAmount: 12000000,
    source: "operator",
    operatorName: "Aliyeva Malika",
    fillialName: "Yunusobod filiali",
    region: "Toshkent",
    waitingTime: 2.5,
  },
  {
    id: "SCR005",
    customerId: 2,
    customerName: "Karimova Nilufar",
    customerPhone: "+998902345678",
    passport: "AB2345678",
    scoringDate: "2024-05-05",
    result: "approved",
    scoringScore: 410,
    scoringModel: "Premium Model v2.0",
    limitAmount: 20000000,
    source: "client_mobile",
    region: "Toshkent",
    waitingTime: 1,
  },
  {
    id: "SCR006",
    customerId: 3,
    customerName: "Rahimov Bekzod",
    customerPhone: "+998903456789",
    passport: "AC3456789",
    scoringDate: "2024-09-15",
    result: "approved",
    scoringScore: 395,
    scoringModel: "Premium Model v1.5",
    limitAmount: 18000000,
    source: "client_mobile",
    region: "Samarqand",
    waitingTime: 3,
  },
  {
    id: "SCR007",
    customerId: 4,
    customerName: "Yusupova Madina",
    customerPhone: "+998904567890",
    passport: "AD4567890",
    scoringDate: "2024-11-20",
    result: "approved",
    scoringScore: 420,
    scoringModel: "Premium Model v2.1",
    limitAmount: 25000000,
    source: "operator",
    operatorName: "Tursunov Bekzod",
    fillialName: "Yashnobod filiali",
    region: "Toshkent",
    waitingTime: 1.5,
  },
  {
    id: "SCR008",
    customerId: 5,
    customerName: "Toshmatov Ulugbek",
    customerPhone: "+998907778899",
    passport: "AE5678901",
    scoringDate: "2024-10-05",
    result: "approved",
    scoringScore: 360,
    scoringModel: "Premium Model v2.0",
    limitAmount: 8000000,
    source: "client_mobile",
    region: "Buxoro",
    waitingTime: 7,
  },
  {
    id: "SCR009",
    customerId: 6,
    customerName: "Saidova Shoira",
    customerPhone: "+998908889900",
    passport: "AF6789012",
    scoringDate: "2024-11-01",
    result: "approved",
    scoringScore: 418,
    scoringModel: "Premium Model v2.1",
    limitAmount: 30000000,
    source: "operator",
    operatorName: "Xolmatova Dilnoza",
    fillialName: "Mirzo Ulug'bek filiali",
    region: "Toshkent",
    waitingTime: 2,
  },
  {
    id: "SCR010",
    customerId: 7,
    customerName: "Aliyev Rustam",
    customerPhone: "+998909990011",
    passport: "AG7890123",
    scoringDate: "2024-10-20",
    result: "approved",
    scoringScore: 375,
    scoringModel: "Premium Model v1.5",
    limitAmount: 12000000,
    source: "client_mobile",
    region: "Farg'ona",
    waitingTime: 2.5,
  },
  {
    id: "SCR011",
    customerId: 8,
    customerName: "Nazarova Gulnoza",
    customerPhone: "+998901112233",
    passport: "AH8901234",
    scoringDate: "2024-09-25",
    result: "approved",
    scoringScore: 388,
    scoringModel: "Premium Model v2.0",
    limitAmount: 15000000,
    source: "operator",
    operatorName: "Rahimov Jasur",
    fillialName: "Sergeli filiali",
    region: "Toshkent",
    waitingTime: 3,
  },
  {
    id: "SCR012",
    customerId: 9,
    customerName: "Qodirov Javohir",
    customerPhone: "+998902223344",
    passport: "AI9012345",
    scoringDate: "2024-11-05",
    result: "approved",
    scoringScore: 370,
    scoringModel: "Premium Model v2.1",
    limitAmount: 10000000,
    source: "client_mobile",
    region: "Andijon",
    waitingTime: 1.5,
  },
  {
    id: "SCR013",
    customerId: 10,
    customerName: "Ismailov Aziz",
    customerPhone: "+998905556677",
    passport: "AJ0123456",
    scoringDate: "2024-10-10",
    result: "approved",
    scoringScore: 405,
    scoringModel: "Premium Model v2.0",
    limitAmount: 20000000,
    source: "operator",
    operatorName: "Saidov Otabek",
    fillialName: "Uchtepa filiali",
    region: "Toshkent",
    waitingTime: 20,
  },
  {
    id: "SCR014",
    customerId: 11,
    customerName: "Mirzayev Bobur",
    customerPhone: "+998906667788",
    passport: "AK1234567",
    scoringDate: "2024-11-12",
    result: "approved",
    scoringScore: 355,
    scoringModel: "Premium Model v1.5",
    limitAmount: 5000000,
    source: "client_mobile",
    region: "Namangan",
    waitingTime: 10,
  },
  {
    id: "SCR015",
    customerId: 12,
    customerName: "Xudoyberganova Dilbar",
    customerPhone: "+998904445566",
    passport: "AL2345678",
    scoringDate: "2024-10-28",
    result: "approved",
    scoringScore: 412,
    scoringModel: "Premium Model v2.1",
    limitAmount: 22000000,
    source: "operator",
    operatorName: "Normatova Saida",
    fillialName: "Bektemir filiali",
    region: "Toshkent",
    waitingTime: 1,
  },
  {
    id: "SCR016",
    customerId: 13,
    customerName: "Sharipov Otabek",
    customerPhone: "+998909998877",
    passport: "AM3456789",
    scoringDate: "2024-11-15",
    result: "approved",
    scoringScore: 390,
    scoringModel: "Premium Model v2.0",
    limitAmount: 16000000,
    source: "client_mobile",
    region: "Qashqadaryo",
    waitingTime: 2,
  },
  {
    id: "SCR017",
    customerId: 14,
    customerName: "Juraev Sardor",
    customerPhone: "+998908887766",
    passport: "AN4567890",
    scoringDate: "2024-10-18",
    result: "approved",
    scoringScore: 380,
    scoringModel: "Premium Model v1.5",
    limitAmount: 14000000,
    source: "operator",
    operatorName: "Ergashev Sanjar",
    fillialName: "Shayxontohur filiali",
    region: "Toshkent",
    waitingTime: 5,
  },
  {
    id: "SCR018",
    customerId: 15,
    customerName: "Axmedova Sevara",
    customerPhone: "+998907776655",
    passport: "AO5678901",
    scoringDate: "2024-11-08",
    result: "approved",
    scoringScore: 365,
    scoringModel: "Premium Model v2.1",
    limitAmount: 9000000,
    source: "client_mobile",
    region: "Surxondaryo",
    waitingTime: 1.5,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const formatWaitingTime = (minutes: number) => {
  const wholeMinutes = Math.floor(minutes);
  const seconds = Math.round((minutes - wholeMinutes) * 60);
  
  if (wholeMinutes === 0) {
    return `${seconds} s`;
  } else if (seconds === 0) {
    return `${wholeMinutes} min`;
  } else {
    return `${wholeMinutes} min ${seconds} s`;
  }
};

export default function ScoringHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterFillial, setFilterFillial] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredRecords = useMemo(() => {
    return MOCK_SCORING_RECORDS.filter((record) => {
      const matchesSearch = 
        record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.customerPhone.includes(searchQuery) ||
        record.passport.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesModel = filterModel === "all" || record.scoringModel === filterModel;
      const matchesResult = filterResult === "all" || record.result === filterResult;
      const matchesSource = filterSource === "all" || record.source === filterSource;
      const matchesRegion = filterRegion === "all" || record.region === filterRegion;
      const matchesFillial = filterFillial === "all" || record.fillialName === filterFillial;
      
      // Date range filter
      let matchesDate = true;
      if (startDate || endDate) {
        const recordDate = new Date(record.scoringDate);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && recordDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && recordDate <= end;
        }
      }
      
      return matchesSearch && matchesModel && matchesResult && matchesSource && matchesRegion && matchesFillial && matchesDate;
    });
  }, [searchQuery, filterModel, filterResult, filterSource, filterRegion, filterFillial, startDate, endDate]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Get unique models
  const uniqueModels = Array.from(new Set(MOCK_SCORING_RECORDS.map(r => r.scoringModel)));
  
  // Get unique regions
  const uniqueRegions = Array.from(new Set(MOCK_SCORING_RECORDS.map(r => r.region))).sort();
  
  // Get unique fillials (only from operator records)
  const uniqueFillials = Array.from(
    new Set(MOCK_SCORING_RECORDS.filter(r => r.fillialName).map(r => r.fillialName!))
  ).sort();

  // Statistics
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const approved = filteredRecords.filter(r => r.result === "approved").length;
    const rejected = filteredRecords.filter(r => r.result === "rejected").length;
    const avgScore = filteredRecords.length > 0 
      ? Math.round(filteredRecords.reduce((sum, r) => sum + r.scoringScore, 0) / filteredRecords.length)
      : 0;
    const avgWaitTime = filteredRecords.length > 0
      ? (filteredRecords.reduce((sum, r) => sum + r.waitingTime, 0) / filteredRecords.length).toFixed(1)
      : 0;
    
    return { total, approved, rejected, avgScore, avgWaitTime };
  }, [filteredRecords]);

  return (
    <div className="mt-5 h-full w-full">
      <Card extra="w-full pb-10 p-4 h-full">
        {/* Header */}
        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/50">
              <ChartBar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                Skoring tarixi
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Barcha mijozlarning skoring natijalari
              </p>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Jami skoringlar</p>
            <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Tasdiqlangan</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">Rad etilgan</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">O'rtacha ball</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.avgScore}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-navy-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">O'rtacha kutish</p>
            <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgWaitTime} min</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col gap-3">
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
          
          {/* Date Range Picker */}
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onStartChange={setStartDate} 
            onEndChange={setEndDate}
          />
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrlar:</span>
            </div>
            
            <CustomSelect
              value={filterRegion}
              onChange={(value) => {
                setFilterRegion(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha hududlar" },
                ...uniqueRegions.map(region => ({ value: region, label: region }))
              ]}
              className="min-w-[150px]"
            />
            
            <CustomSelect
              value={filterFillial}
              onChange={(value) => {
                setFilterFillial(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha filiallar" },
                ...uniqueFillials.map(fillial => ({ value: fillial, label: fillial }))
              ]}
              className="min-w-[180px]"
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
              className="min-w-[180px]"
            />
            
            <CustomSelect
              value={filterResult}
              onChange={(value) => {
                setFilterResult(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha natijalar" },
                { value: "approved", label: "Tasdiqlangan" },
                { value: "rejected", label: "Rad etilgan" }
              ]}
              className="min-w-[150px]"
            />
            
            <CustomSelect
              value={filterSource}
              onChange={(value) => {
                setFilterSource(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Barcha manbalar" },
                { value: "client_mobile", label: "Client Mobile" },
                { value: "operator", label: "Operator" }
              ]}
              className="min-w-[150px]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
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
                  Sana
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Ball
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Model
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Manba
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Limit
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Natija
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Kutish vaqti
                </th>
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Sabab
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-gray-500">
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                currentRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                    onClick={() => {
                      setSelectedCustomerId(record.customerId);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-navy-700 dark:text-white">
                            {record.customerName}
                          </div>
                          <div className="text-xs text-gray-500">{record.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(record.scoringDate)}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                        record.scoringScore >= 350
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : record.scoringScore >= 250
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {record.scoringScore}
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {record.scoringModel}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        {record.source === "client_mobile" ? (
                          <>
                            <DeviceMobile className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Client Mobile
                            </span>
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4 text-purple-600" />
                            <div className="text-xs">
                              <div className="font-medium text-purple-600 dark:text-purple-400">
                                {record.operatorName}
                              </div>
                              <div className="text-gray-500">{record.fillialName}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {record.limitAmount ? formatCurrency(record.limitAmount) : "-"}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        record.result === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {record.result === "approved" ? "✓ Tasdiqlandi" : "✗ Rad etildi"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium ${
                        record.waitingTime <= 3
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : record.waitingTime <= 10
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatWaitingTime(record.waitingTime)}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-red-600 dark:text-red-400">
                      {record.rejectionReason || "-"}
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
            {`${filteredRecords.length} dan ${currentRecords.length} ta ko'rsatilmoqda`}
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
      {showDetailModal && selectedCustomerId && (() => {
        const customerRecords = MOCK_SCORING_RECORDS.filter(r => r.customerId === selectedCustomerId);
        const customerInfo = customerRecords[0];
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-navy-800">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                    {customerInfo.customerName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {customerInfo.customerPhone} • {customerInfo.passport}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  Jami skoringlar: {customerRecords.length}
                </p>
              </div>

              <div className="space-y-3">
                {customerRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`rounded-lg border p-4 ${
                      record.result === "approved"
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(record.scoringDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {record.source === "client_mobile" ? (
                            <>
                              <DeviceMobile className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                Client Mobile
                              </span>
                            </>
                          ) : (
                            <>
                              <Phone className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                Operator: {record.operatorName} ({record.fillialName})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                          record.scoringScore >= 350
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : record.scoringScore >= 250
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          Ball: {record.scoringScore}
                        </div>
                        <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                          record.result === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {record.result === "approved" ? "Tasdiqlandi" : "Rad etildi"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Model: </span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {record.scoringModel}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Kutish vaqti: </span>
                        <span className={`font-medium ${
                          record.waitingTime <= 3
                            ? "text-green-600 dark:text-green-400"
                            : record.waitingTime <= 10
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {formatWaitingTime(record.waitingTime)}
                        </span>
                      </div>
                      {record.result === "approved" && record.limitAmount && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Limit: </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(record.limitAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                    {record.result === "rejected" && record.rejectionReason && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        <span className="font-medium">Sabab: </span>{record.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-lg bg-brand-500 px-6 py-2 font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
