import { useState, useMemo } from "react";
import Card from "components/card";
import { Search, User, FileText, BuildingStore, Calendar, ShieldCheck, Phone, DeviceMobile, CircleCheck } from "tabler-icons-react";
import Pagination from "components/pagination";
import CustomSelect from "components/dropdown/CustomSelect";

// Types
type ScoringResult = "approved" | "rejected";
type ApplicationSource = "client_mobile" | "operator";

type ApplicationDetail = {
  id: string;
  productName: string;
  productPrice: number;
  totalAmount: number;
  fillialName: string;
  merchantName: string;
  region: string;
  applicationDate: string;
  contractMonths: number;
  monthlyPayment: number;
  status: "active" | "completed" | "rejected";
};

type ScoringDetail = {
  id: string;
  scoringDate: string;
  result: ScoringResult;
  limitAmount?: number;
  rejectionReason?: string;
  source: ApplicationSource;
  operatorName?: string;
  fillialName?: string;
  scoringScore: number;
  scoringModel: string;
};

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
  debt: number; // Qarzdorlik
  applications: ApplicationDetail[];
  scorings: ScoringDetail[];
};

// Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    fullName: "Abdullayev Jasur",
    phone: "+998901234567",
    passport: "AA1234567",
    birthDate: "1990-05-15",
    region: "Toshkent",
    address: "Chilonzor tumani, 12-mavze",
    registrationDate: "2023-01-15",
    totalApplications: 5,
    activeApplications: 2,
    completedApplications: 2,
    rejectedApplications: 1,
    debt: 1700000, // Qarzdorlik bor
    applications: [
      {
        id: "APP001",
        productName: "Samsung Galaxy S23",
        productPrice: 8500000,
        totalAmount: 10200000,
        fillialName: "Chilonzor filiali",
        merchantName: "Texnomart",
        region: "Toshkent",
        applicationDate: "2024-11-01",
        contractMonths: 12,
        monthlyPayment: 850000,
        status: "active",
      },
      {
        id: "APP002",
        productName: "LG Muzlatgich",
        productPrice: 6000000,
        totalAmount: 6600000,
        fillialName: "Sergeli filiali",
        merchantName: "Artel Plaza",
        region: "Toshkent",
        applicationDate: "2024-10-15",
        contractMonths: 12,
        monthlyPayment: 550000,
        status: "active",
      },
      {
        id: "APP003",
        productName: "iPhone 14",
        productPrice: 12000000,
        totalAmount: 13200000,
        fillialName: "Chilonzor filiali",
        merchantName: "Texnomart",
        region: "Toshkent",
        applicationDate: "2024-06-10",
        contractMonths: 12,
        monthlyPayment: 1100000,
        status: "completed",
      },
    ],
    scorings: [
      {
        id: "SCR001",
        scoringDate: "2024-11-01",
        result: "approved",
        limitAmount: 15000000,
        source: "client_mobile",
        scoringScore: 420,
        scoringModel: "Premium Model v2.1",
      },
      {
        id: "SCR002",
        scoringDate: "2024-10-15",
        result: "approved",
        limitAmount: 10000000,
        source: "operator",
        operatorName: "Karimov Shavkat",
        fillialName: "Chilonzor filiali",
        scoringScore: 350,
        scoringModel: "Premium Model v2.0",
      },
      {
        id: "SCR003",
        scoringDate: "2024-08-20",
        result: "rejected",
        rejectionReason: "Yomon kredit tarixi",
        source: "client_mobile",
        scoringScore: 180,
        scoringModel: "Premium Model v1.5",
      },
    ],
  },
  {
    id: 2,
    fullName: "Karimova Nigora",
    phone: "+998907654321",
    passport: "AB7654321",
    birthDate: "1995-08-22",
    region: "Samarqand",
    address: "Registon ko'chasi, 45",
    registrationDate: "2023-03-20",
    totalApplications: 3,
    activeApplications: 1,
    completedApplications: 2,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP004",
        productName: "Artel Kir yuvish mashinasi",
        productPrice: 4500000,
        totalAmount: 4950000,
        fillialName: "Samarqand markaz",
        merchantName: "Artel Plaza",
        region: "Samarqand",
        applicationDate: "2024-11-10",
        contractMonths: 10,
        monthlyPayment: 495000,
        status: "active",
      },
      {
        id: "APP005",
        productName: "MacBook Air",
        productPrice: 15000000,
        totalAmount: 16500000,
        fillialName: "Samarqand markaz",
        merchantName: "Texnomart",
        region: "Samarqand",
        applicationDate: "2024-05-05",
        contractMonths: 12,
        monthlyPayment: 1375000,
        status: "completed",
      },
    ],
    scorings: [
      {
        id: "SCR004",
        scoringDate: "2024-11-10",
        result: "approved",
        limitAmount: 12000000,
        source: "operator",
        operatorName: "Aliyeva Malika",
        fillialName: "Yunusobod filiali",
        scoringScore: 385,
        scoringModel: "Premium Model v2.1",
      },
      {
        id: "SCR005",
        scoringDate: "2024-05-05",
        result: "approved",
        limitAmount: 20000000,
        source: "client_mobile",
        scoringScore: 410,
        scoringModel: "Premium Model v2.0",
      },
    ],
  },
  {
    id: 3,
    fullName: "Xolmatov Sardor",
    phone: "+998901112233",
    passport: "AC9876543",
    birthDate: "1988-12-10",
    region: "Buxoro",
    address: "Buxoro shahri, 25-uy",
    registrationDate: "2023-05-12",
    totalApplications: 4,
    activeApplications: 1,
    completedApplications: 3,
    rejectedApplications: 0,
    debt: 850000,
    applications: [
      {
        id: "APP006",
        productName: "Samsung TV 55''",
        productPrice: 7500000,
        totalAmount: 8250000,
        fillialName: "Buxoro filiali",
        merchantName: "Texnomart",
        region: "Buxoro",
        applicationDate: "2024-09-15",
        contractMonths: 12,
        monthlyPayment: 687500,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR006",
        scoringDate: "2024-09-15",
        result: "approved",
        limitAmount: 18000000,
        source: "client_mobile",
        scoringScore: 395,
        scoringModel: "Premium Model v1.5",
      },
    ],
  },
  {
    id: 4,
    fullName: "Rahimova Dilnoza",
    phone: "+998904445566",
    passport: "AD1122334",
    birthDate: "1992-03-25",
    region: "Andijon",
    address: "Andijon shahri, 10-ko'cha",
    registrationDate: "2023-07-20",
    totalApplications: 2,
    activeApplications: 2,
    completedApplications: 0,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP007",
        productName: "iPhone 15 Pro",
        productPrice: 18000000,
        totalAmount: 19800000,
        fillialName: "Andijon markaz",
        merchantName: "Texnomart",
        region: "Andijon",
        applicationDate: "2024-11-20",
        contractMonths: 12,
        monthlyPayment: 1650000,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR007",
        scoringDate: "2024-11-20",
        result: "approved",
        limitAmount: 25000000,
        source: "operator",
        operatorName: "Tursunov Bekzod",
        fillialName: "Yashnobod filiali",
        scoringScore: 420,
        scoringModel: "Premium Model v2.1",
      },
    ],
  },
  {
    id: 5,
    fullName: "Toshmatov Ulugbek",
    phone: "+998907778899",
    passport: "AE5544332",
    birthDate: "1985-06-18",
    region: "Namangan",
    address: "Namangan shahri, 5-mavze",
    registrationDate: "2023-02-28",
    totalApplications: 6,
    activeApplications: 1,
    completedApplications: 4,
    rejectedApplications: 1,
    debt: 2100000,
    applications: [
      {
        id: "APP008",
        productName: "Artel Konditsioner",
        productPrice: 5000000,
        totalAmount: 5500000,
        fillialName: "Namangan filiali",
        merchantName: "Artel Plaza",
        region: "Namangan",
        applicationDate: "2024-10-05",
        contractMonths: 10,
        monthlyPayment: 550000,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR008",
        scoringDate: "2024-10-05",
        result: "approved",
        limitAmount: 8000000,
        source: "client_mobile",
        scoringScore: 360,
        scoringModel: "Premium Model v2.0",
      },
    ],
  },
  {
    id: 6,
    fullName: "Yusupova Madina",
    phone: "+998903334455",
    passport: "AF6677889",
    birthDate: "1998-09-12",
    region: "Farg'ona",
    address: "Farg'ona shahri, 30-uy",
    registrationDate: "2023-08-15",
    totalApplications: 3,
    activeApplications: 1,
    completedApplications: 2,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP009",
        productName: "MacBook Pro 14''",
        productPrice: 22000000,
        totalAmount: 24200000,
        fillialName: "Farg'ona markaz",
        merchantName: "Texnomart",
        region: "Farg'ona",
        applicationDate: "2024-11-01",
        contractMonths: 12,
        monthlyPayment: 2016666,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR009",
        scoringDate: "2024-11-01",
        result: "approved",
        limitAmount: 30000000,
        source: "operator",
        operatorName: "Xolmatova Dilnoza",
        fillialName: "Mirzo Ulug'bek filiali",
        scoringScore: 418,
        scoringModel: "Premium Model v2.1",
      },
    ],
  },
  {
    id: 7,
    fullName: "Aliyev Rustam",
    phone: "+998909990011",
    passport: "AG3344556",
    birthDate: "1993-04-22",
    region: "Toshkent",
    address: "Yakkasaroy tumani, 8-mavze",
    registrationDate: "2023-04-10",
    totalApplications: 5,
    activeApplications: 2,
    completedApplications: 2,
    rejectedApplications: 1,
    debt: 0,
    applications: [
      {
        id: "APP010",
        productName: "Sony PlayStation 5",
        productPrice: 6500000,
        totalAmount: 7150000,
        fillialName: "Yakkasaroy filiali",
        merchantName: "Texnomart",
        region: "Toshkent",
        applicationDate: "2024-10-20",
        contractMonths: 12,
        monthlyPayment: 595833,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR010",
        scoringDate: "2024-10-20",
        result: "approved",
        limitAmount: 12000000,
        source: "client_mobile",
        scoringScore: 375,
        scoringModel: "Premium Model v1.5",
      },
    ],
  },
  {
    id: 8,
    fullName: "Nazarova Shoira",
    phone: "+998905556677",
    passport: "AH7788990",
    birthDate: "1991-11-30",
    region: "Samarqand",
    address: "Samarqand shahri, 15-ko'cha",
    registrationDate: "2023-06-05",
    totalApplications: 4,
    activeApplications: 1,
    completedApplications: 3,
    rejectedApplications: 0,
    debt: 1200000,
    applications: [
      {
        id: "APP011",
        productName: "LG Dishwasher",
        productPrice: 8000000,
        totalAmount: 8800000,
        fillialName: "Samarqand markaz",
        merchantName: "Artel Plaza",
        region: "Samarqand",
        applicationDate: "2024-09-25",
        contractMonths: 12,
        monthlyPayment: 733333,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR011",
        scoringDate: "2024-09-25",
        result: "approved",
        limitAmount: 15000000,
        source: "operator",
        operatorName: "Rahimov Jasur",
        fillialName: "Sergeli filiali",
        scoringScore: 388,
        scoringModel: "Premium Model v2.0",
      },
    ],
  },
  {
    id: 9,
    fullName: "Qodirov Javohir",
    phone: "+998902223344",
    passport: "AI9988776",
    birthDate: "1987-07-14",
    region: "Xorazm",
    address: "Urganch shahri, 12-uy",
    registrationDate: "2023-09-18",
    totalApplications: 2,
    activeApplications: 1,
    completedApplications: 1,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP012",
        productName: "Samsung Washing Machine",
        productPrice: 5500000,
        totalAmount: 6050000,
        fillialName: "Urganch filiali",
        merchantName: "Texnomart",
        region: "Xorazm",
        applicationDate: "2024-11-05",
        contractMonths: 10,
        monthlyPayment: 605000,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR012",
        scoringDate: "2024-11-05",
        result: "approved",
        limitAmount: 10000000,
        source: "client_mobile",
        scoringScore: 370,
        scoringModel: "Premium Model v2.1",
      },
    ],
  },
  {
    id: 10,
    fullName: "Ismoilova Zarina",
    phone: "+998908889977",
    passport: "AJ1122335",
    birthDate: "1996-02-08",
    region: "Qashqadaryo",
    address: "Qarshi shahri, 20-ko'cha",
    registrationDate: "2023-10-22",
    totalApplications: 3,
    activeApplications: 1,
    completedApplications: 1,
    rejectedApplications: 1,
    debt: 0,
    applications: [
      {
        id: "APP013",
        productName: "iPad Pro 12.9''",
        productPrice: 14000000,
        totalAmount: 15400000,
        fillialName: "Qarshi filiali",
        merchantName: "Texnomart",
        region: "Qashqadaryo",
        applicationDate: "2024-10-10",
        contractMonths: 12,
        monthlyPayment: 1283333,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR013",
        scoringDate: "2024-10-10",
        result: "approved",
        limitAmount: 20000000,
        source: "operator",
        operatorName: "Saidov Otabek",
        fillialName: "Uchtepa filiali",
        scoringScore: 405,
        scoringModel: "Premium Model v2.0",
      },
    ],
  },
  {
    id: 11,
    fullName: "Mirzayev Bobur",
    phone: "+998906667788",
    passport: "AK4455667",
    birthDate: "1989-05-19",
    region: "Surxondaryo",
    address: "Termiz shahri, 7-mavze",
    registrationDate: "2023-11-30",
    totalApplications: 4,
    activeApplications: 2,
    completedApplications: 2,
    rejectedApplications: 0,
    debt: 500000,
    applications: [
      {
        id: "APP014",
        productName: "Artel Microwave",
        productPrice: 2500000,
        totalAmount: 2750000,
        fillialName: "Termiz filiali",
        merchantName: "Artel Plaza",
        region: "Surxondaryo",
        applicationDate: "2024-11-12",
        contractMonths: 6,
        monthlyPayment: 458333,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR014",
        scoringDate: "2024-11-12",
        result: "approved",
        limitAmount: 5000000,
        source: "client_mobile",
        scoringScore: 355,
        scoringModel: "Premium Model v1.5",
      },
    ],
  },
  {
    id: 12,
    fullName: "Ergasheva Feruza",
    phone: "+998901112222",
    passport: "AL8877665",
    birthDate: "1994-08-03",
    region: "Jizzax",
    address: "Jizzax shahri, 18-uy",
    registrationDate: "2023-12-15",
    totalApplications: 2,
    activeApplications: 1,
    completedApplications: 1,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP015",
        productName: "Dell XPS 15",
        productPrice: 19000000,
        totalAmount: 20900000,
        fillialName: "Jizzax markaz",
        merchantName: "Texnomart",
        region: "Jizzax",
        applicationDate: "2024-10-28",
        contractMonths: 12,
        monthlyPayment: 1741666,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR015",
        scoringDate: "2024-10-28",
        result: "approved",
        limitAmount: 22000000,
        source: "operator",
        operatorName: "Normatova Saida",
        fillialName: "Bektemir filiali",
        scoringScore: 412,
        scoringModel: "Premium Model v2.1",
      },
    ],
  },
  {
    id: 13,
    fullName: "Sharipov Otabek",
    phone: "+998909998877",
    passport: "AM5566778",
    birthDate: "1990-10-11",
    region: "Navoiy",
    address: "Navoiy shahri, 9-ko'cha",
    registrationDate: "2024-01-20",
    totalApplications: 3,
    activeApplications: 1,
    completedApplications: 2,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP016",
        productName: "Samsung Refrigerator",
        productPrice: 9500000,
        totalAmount: 10450000,
        fillialName: "Navoiy filiali",
        merchantName: "Artel Plaza",
        region: "Navoiy",
        applicationDate: "2024-11-15",
        contractMonths: 12,
        monthlyPayment: 870833,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR016",
        scoringDate: "2024-11-15",
        result: "approved",
        limitAmount: 16000000,
        source: "client_mobile",
        scoringScore: 390,
        scoringModel: "Premium Model v2.0",
      },
    ],
  },
  {
    id: 14,
    fullName: "Karimov Shoxrux",
    phone: "+998903335577",
    passport: "AN2233445",
    birthDate: "1986-01-27",
    region: "Sirdaryo",
    address: "Guliston shahri, 14-mavze",
    registrationDate: "2024-02-10",
    totalApplications: 5,
    activeApplications: 2,
    completedApplications: 3,
    rejectedApplications: 0,
    debt: 0,
    applications: [
      {
        id: "APP017",
        productName: "HP Laptop",
        productPrice: 10000000,
        totalAmount: 11000000,
        fillialName: "Guliston filiali",
        merchantName: "Texnomart",
        region: "Sirdaryo",
        applicationDate: "2024-10-18",
        contractMonths: 12,
        monthlyPayment: 916666,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR017",
        scoringDate: "2024-10-18",
        result: "approved",
        limitAmount: 14000000,
        source: "operator",
        operatorName: "Ergashev Sanjar",
        fillialName: "Shayxontohur filiali",
        scoringScore: 380,
        scoringModel: "Premium Model v1.5",
      },
    ],
  },
  {
    id: 15,
    fullName: "Axmedova Sevara",
    phone: "+998907776655",
    passport: "AO6655443",
    birthDate: "1997-12-05",
    region: "Toshkent",
    address: "Uchtepa tumani, 22-uy",
    registrationDate: "2024-03-05",
    totalApplications: 2,
    activeApplications: 1,
    completedApplications: 1,
    rejectedApplications: 0,
    debt: 950000,
    applications: [
      {
        id: "APP018",
        productName: "Artel Air Conditioner",
        productPrice: 4800000,
        totalAmount: 5280000,
        fillialName: "Uchtepa filiali",
        merchantName: "Artel Plaza",
        region: "Toshkent",
        applicationDate: "2024-11-08",
        contractMonths: 10,
        monthlyPayment: 528000,
        status: "active",
      },
    ],
    scorings: [
      {
        id: "SCR018",
        scoringDate: "2024-11-08",
        result: "approved",
        limitAmount: 9000000,
        source: "client_mobile",
        scoringScore: 365,
        scoringModel: "Premium Model v2.1",
      },
    ],
  },
];

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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter((customer) =>
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.passport.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

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

        {/* Search */}
        <div className="mt-6 flex items-center gap-3">
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
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jami mijozlar</p>
                <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{MOCK_CUSTOMERS.length}</p>
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
                  {MOCK_CUSTOMERS.reduce((sum, c) => sum + c.activeApplications, 0)}
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
                  {MOCK_CUSTOMERS.reduce((sum, c) => sum + c.completedApplications, 0)}
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
                  {MOCK_CUSTOMERS.reduce((sum, c) => sum + c.rejectedApplications, 0)}
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
                <th className="pb-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Ro'yxatdan o'tgan
                </th>
                <th className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Batafsil
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-4 text-sm font-medium text-navy-700 dark:text-white">
                      <div>{customer.fullName}</div>
                      <div className="text-xs text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                      {customer.passport}
                    </td>
                    <td className="py-4 text-sm text-indigo-600 dark:text-indigo-400">
                      {customer.region}
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
                      <button className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600">
                        Ko'rish
                      </button>
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
            {`${filteredCustomers.length} dan ${currentCustomers.length} ta ko'rsatilmoqda`}
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
            <div className="mb-4 flex items-center justify-between">
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">F.I.O</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefon</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passport</p>
                  <p className="mt-1 text-base font-mono font-semibold text-navy-700 dark:text-white">{selectedCustomer.passport}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tug'ilgan sana</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{formatDate(selectedCustomer.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hudud</p>
                  <p className="mt-1 text-base font-semibold text-indigo-600">{selectedCustomer.region}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manzil</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{selectedCustomer.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ro'yxatdan o'tgan sana</p>
                  <p className="mt-1 text-base font-semibold text-navy-700 dark:text-white">{formatDate(selectedCustomer.registrationDate)}</p>
                </div>
              </div>

              {/* Applications Section */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">
                  Arizalar ro'yxati ({selectedCustomer.applications.length})
                </p>
                <div className="space-y-3">
                  {selectedCustomer.applications.map((app) => (
                    <div
                      key={app.id}
                      className={`rounded-lg border p-4 ${
                        app.status === "completed"
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : app.status === "active"
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-500">{app.id}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(app.applicationDate)}
                          </span>
                          <div className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                            app.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : app.status === "active"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {app.status === "completed" ? "Yakunlangan" : app.status === "active" ? "Faol" : "Rad etilgan"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-navy-700 dark:text-white">{app.productName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Narxi: {formatCurrency(app.productPrice)} • Jami: {formatCurrency(app.totalAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400">
                          <BuildingStore className="h-4 w-4" />
                          <span>{app.merchantName} - {app.fillialName}</span>
                          <span className="text-xs text-gray-500">({app.region})</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Muddat: {app.contractMonths} oy • Oylik to'lov: {formatCurrency(app.monthlyPayment)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scorings Section */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="mb-3 text-sm font-bold text-navy-700 dark:text-white">
                  Skoring tarixi ({selectedCustomer.scorings.length})
                </p>
                <div className="space-y-3">
                  {selectedCustomer.scorings.map((scoring) => (
                    <div
                      key={scoring.id}
                      className={`rounded-lg border p-4 ${
                        scoring.result === "approved"
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(scoring.scoringDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {scoring.source === "client_mobile" ? (
                              <DeviceMobile className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Phone className="h-4 w-4 text-purple-600" />
                            )}
                            <span className={`text-xs font-medium ${
                              scoring.source === "client_mobile"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-purple-600 dark:text-purple-400"
                            }`}>
                              {scoring.source === "client_mobile" 
                                ? "Client Mobile" 
                                : `Operator${scoring.operatorName ? `: ${scoring.operatorName}` : ""}${scoring.fillialName ? ` (${scoring.fillialName})` : ""}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                            scoring.scoringScore >= 350
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : scoring.scoringScore >= 250
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            Ball: {scoring.scoringScore}
                          </div>
                          <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                            scoring.result === "approved"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {scoring.result === "approved" ? "Tasdiqlandi" : "Rad etildi"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Model: </span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {scoring.scoringModel}
                          </span>
                        </div>
                        {scoring.result === "approved" && scoring.limitAmount && (
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Limit: </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(scoring.limitAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                      {scoring.result === "rejected" && scoring.rejectionReason && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          Sabab: {scoring.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
      )}
    </div>
  );
}
