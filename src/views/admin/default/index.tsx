import React from "react";
import api from "lib/mockApi";
import DateRangePicker from "components/DateRangePicker";
import CustomSelect from "components/dropdown/CustomSelect";
// formatShortMoney removed (unused in this view)
import TotalSpent from "./components/TotalSpent";
import WeeklyRevenue from "./components/WeeklyRevenue";
import PieChartCard from "./components/PieChartCard";
import DailyTraffic from "./components/DailyTraffic";
import ErrorBoundary from "components/ErrorBoundary";
import Widget from "components/widget/Widget";
import { MdBarChart, MdDashboard } from "react-icons/md";
import { IoDocuments } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";

const Dashboard = (): JSX.Element => {
  const [fillials, setFillials] = React.useState<any[]>([]);
  const [usersCount, setUsersCount] = React.useState<number>(0);
  const [applicationsCount, setApplicationsCount] = React.useState<number>(0);
  const [approvedAmount, setApprovedAmount] = React.useState<number>(0);
  const [pendingCount, setPendingCount] = React.useState<number>(0);
  const [totalProducts, setTotalProducts] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [selectedFillialId, setSelectedFillialId] = React.useState<number | "all">("all");
  const [selectedRegion, setSelectedRegion] = React.useState<string>("all");
  // charts removed: barData, pieData, lineData
  // pagination state for fillial cards removed

  React.useEffect(() => {
    let mounted = true;
  api.listFillials({ page: 1, pageSize: 100 }).then((res) => { if (!mounted) return; setFillials(res.items); });
    return () => { mounted = false; };
  }, []);

  // fetch global counts for dashboard widgets
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const apps = await api.listApplications({ page: 1, pageSize: 10000 });
        const users = await api.listUsers({ page: 1, pageSize: 10000 });
        if (!mounted) return;
        setApplicationsCount(apps.items.length);
        setUsersCount(users.items.length);
        const approved = apps.items.filter((a:any) => a.status === "APPROVED");
        setApprovedAmount(approved.reduce((s:any, a:any) => s + (a.amount ?? 0), 0));
        const pending = apps.items.filter((a:any) => a.status !== "APPROVED");
        setPendingCount(pending.length);
        // compute total products across all applications
        const prodCount = apps.items.reduce((acc:any, a:any) => {
          if (Array.isArray(a.products)) return acc + a.products.reduce((s:any, p:any) => s + (p.count ?? 1), 0);
          return acc;
        }, 0);
        setTotalProducts(prodCount);
        // daily purchases and system health tracking removed (unused)
      } catch (e) {
        // ignore for now
      }
    })();
    return () => { mounted = false; };
  }, []);

  // metrics are provided by the reusable dashboard components in ./components

  // aggregation/useEffect for charts removed

  // prettier chart options
  // chart option constants removed

  // filteredFillials and usersByFillial removed - fillial list cards are hidden per request

  // (previously computed stats were displayed in a different layout; kept data in state for future cards)

  const regions = React.useMemo(() => {
    const s = new Set<string>();
    fillials.forEach((f) => { if (f.region) s.add(f.region); });
    return ["all", ...Array.from(s)];
  }, [fillials]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold dark:text-white">Admin</h2>
          <div className="text-sm text-gray-500 dark:text-gray-300">Asosiy ko'rsatkichlar va tizim holati</div>
        </div>
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filial yoki manzil bo'yicha qidirish" className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 w-64 bg-white dark:bg-navy-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
          <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          <CustomSelect
            value={selectedRegion}
            onChange={(value) => { setSelectedRegion(value); setSelectedFillialId("all"); }}
            options={regions.map(r => ({ 
              value: r, 
              label: r === "all" ? "Barcha hududlar" : r 
            }))}
            className="min-w-[140px]"
          />
          <CustomSelect
            value={String(selectedFillialId)}
            onChange={(value) => { setSelectedFillialId(value === "all" ? "all" : Number(value)); }}
            options={[
              { value: "all", label: "Barcha filiallar" },
              ...fillials.filter((f) => selectedRegion === "all" || f.region === selectedRegion).map((f) => ({ 
                value: String(f.id), 
                label: f.name 
              }))
            ]}
            className="min-w-[150px]"
          />
        </div>
      </div>

      {/* Widget grid (top) */}
    <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
    <Widget icon={<MdBarChart className="h-7 w-7" />} title={"Jami arizalar"} subtitle={String(applicationsCount)} />
    <Widget icon={<IoDocuments className="h-6 w-6" />} title={"Tasdiqlangan summa"} subtitle={`${approvedAmount.toLocaleString()} UZS`} />
    <Widget icon={<MdBarChart className="h-7 w-7" />} title={"Jami operatorlar"} subtitle={String(usersCount)} />
    <Widget icon={<MdDashboard className="h-6 w-6" />} title={"Faol filiallar"} subtitle={String(fillials.length)} />
    <Widget icon={<MdBarChart className="h-7 w-7" />} title={"Kutilayotgan arizalar"} subtitle={String(pendingCount)} />
    <Widget icon={<IoMdHome className="h-6 w-6" />} title={"Jami mahsulotlar"} subtitle={String(totalProducts)} />
  </div>

      {/* Top template cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 items-stretch auto-rows-min">
        <ErrorBoundary>
          <TotalSpent />
        </ErrorBoundary>

        <ErrorBoundary>
          <WeeklyRevenue />
        </ErrorBoundary>

        <ErrorBoundary>
          <PieChartCard />
        </ErrorBoundary>

        <ErrorBoundary>
          <DailyTraffic />
        </ErrorBoundary>
      </div>

      {/* small stat cards removed (duplicate / copyable cards) */}

      {/* Charts and task row removed per request (Applications by Fillial, Status distribution, Applications over time, Tasks) */}

      {/* Fillial cards removed per request */}
    </div>
  );
};

export default Dashboard;
