import React from "react";
import PieChart from "components/charts/PieChart";
import { pieChartOptions } from "variables/charts";
import Card from "components/card";
import CustomSelect from "components/dropdown/CustomSelect";
import api from "lib/api";
import { isApproved, isConfirmed, isRejected, isPending } from "lib/formatters";

interface PieChartCardProps {
  startDate?: string;
  endDate?: string;
  fillialId?: number | "all";
  region?: string;
  search?: string;
  fillials?: any[];
  expiredMonth?: number | "all";
}

const PieChartCard: React.FC<PieChartCardProps> = ({ 
  startDate = "", 
  endDate = "", 
  fillialId = "all", 
  region = "all",
  search = "",
  fillials = [],
  expiredMonth = "all"
}) => {
  const [timePeriod, setTimePeriod] = React.useState("daily");
  const [statusDistribution, setStatusDistribution] = React.useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStatusData = async () => {
      try {
        const response = await api.listApplications({ page: 1, pageSize: 10000 });
        let applications = response?.items || [];
        
        // Ensure fillials is an array
        const fillialsList = Array.isArray(fillials) ? fillials : [];
        
        // Apply global filters first
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          applications = applications.filter(app => {
            if (!app.createdAt) return false;
            const appDate = new Date(app.createdAt);
            return appDate >= start && appDate <= end;
          });
        }

        if (fillialId !== "all") {
          applications = applications.filter(app => app.fillial_id === fillialId);
        } else if (region !== "all") {
          const regionFillials = fillialsList.filter(f => f.region === region);
          const regionFillialIds = regionFillials.map(f => f.id);
          applications = applications.filter(app => regionFillialIds.includes(app.fillial_id));
        }

        if (search.trim()) {
          const searchLower = search.toLowerCase();
          const matchingFillials = fillialsList.filter(f => 
            f.name?.toLowerCase().includes(searchLower) || 
            f.address?.toLowerCase().includes(searchLower)
          );
          const matchingFillialIds = matchingFillials.map(f => f.id);
          applications = applications.filter(app => matchingFillialIds.includes(app.fillial_id));
        }

        // Filter by expired month
        if (expiredMonth !== "all") {
          applications = applications.filter(app => app.expired_month && app.expired_month === String(expiredMonth));
        }
        
        // Filter by time period
        const now = new Date();
        const filtered = applications.filter(app => {
          if (!app.createdAt) return true;
          const createdDate = new Date(app.createdAt);
          
          switch (timePeriod) {
            case "daily":
              const today = new Date();
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
              return createdDate >= todayStart && createdDate < todayEnd;
            case "weekly":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return createdDate >= weekAgo;
            case "monthly":
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return createdDate >= monthAgo;
            case "yearly":
              const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
              return createdDate >= yearAgo;
            default:
              return true;
          }
        });
        
        const counts = {
          approved: filtered.filter(app => isApproved(app.status) || isConfirmed(app.status)).length,
          pending: filtered.filter(app => isPending(app.status)).length,
          rejected: filtered.filter(app => isRejected(app.status)).length,
          total: filtered.length
        };
        
        setStatusDistribution(counts);
      } catch (error) {
        console.error("Error loading status data:", error);
        // Set default data if error occurs
        setStatusDistribution({
          approved: 1,
          rejected: 1,
          pending: 1,
          total: 3
        });
      } finally {
        setLoading(false);
      }
    };

    loadStatusData();
  }, [timePeriod, startDate, endDate, fillialId, region, search, fillials, expiredMonth]);

  const approvedPercent = statusDistribution.total > 0 
    ? Math.round((statusDistribution.approved / statusDistribution.total) * 100) 
    : 0;
  const rejectedPercent = statusDistribution.total > 0 
    ? Math.round((statusDistribution.rejected / statusDistribution.total) * 100) 
    : 0;
  const pendingPercent = statusDistribution.total > 0 
    ? Math.round((statusDistribution.pending / statusDistribution.total) * 100) 
    : 0;

  // Create dynamic chart data with 3 statuses: Rejected, Approved, Pending
  const dynamicChartData = [rejectedPercent, approvedPercent, pendingPercent];
  
  // Ensure we have valid data - if all are 0, show placeholder data
  const hasValidData = dynamicChartData.some(val => val > 0);
  const safeChartData = hasValidData ? dynamicChartData : [33, 33, 34];
  
  const dynamicChartOptions = {
    ...pieChartOptions,
    labels: ["Rad qilingan", "Tugatilgan", "Kutilmoqda"],
    colors: ["#EF4444", "#10B981", "#F59E0B"], // Red, Green, Yellow
    fill: {
      ...pieChartOptions.fill,
      colors: ["#EF4444", "#10B981", "#F59E0B"] // Match with colors array
    },
    // Add safety options for chart rendering
    chart: {
      ...pieChartOptions.chart,
      animations: {
        enabled: false // Disable animations to prevent render issues
      }
    }
  };

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-between px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Arizalar statistikasi
          </h4>
        </div>

        <div className="mb-6 flex items-center justify-center">
          <CustomSelect
            value={timePeriod}
            onChange={setTimePeriod}
            options={[
              { value: "daily", label: "Kunlik" },
              { value: "weekly", label: "Haftalik" },
              { value: "monthly", label: "Oylik" },
              { value: "yearly", label: "Yillik" }
            ]}
            className="min-w-[110px]"
          />
        </div>
      </div>

      <div className="mb-auto flex h-full w-full items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center h-[220px]">
            <div className="text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
          </div>
        ) : safeChartData && safeChartData.length > 0 ? (
          <PieChart 
            key={`pie-chart-${timePeriod}`}
            chartOptions={dynamicChartOptions} 
            chartData={safeChartData} 
            series={safeChartData} 
          />
        ) : (
          <div className="flex items-center justify-center h-[220px]">
            <div className="text-gray-500 dark:text-gray-400">Ma'lumot topilmadi</div>
          </div>
        )}
      </div>
      <div className="flex flex-row !justify-between rounded-2xl px-2 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="ml-1 text-xs font-normal text-gray-600 dark:text-gray-300">Rad qilingan</p>
          </div>
          <p className="mt-px text-lg font-bold text-navy-700 dark:text-white">
            {rejectedPercent}%
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="ml-1 text-xs font-normal text-gray-600 dark:text-gray-300">Tugatilgan</p>
          </div>
          <p className="mt-px text-lg font-bold text-navy-700 dark:text-white">
            {approvedPercent}%
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="ml-1 text-xs font-normal text-gray-600 dark:text-gray-300">Kutilmoqda</p>
          </div>
          <p className="mt-px text-lg font-bold text-navy-700 dark:text-white">
            {pendingPercent}%
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PieChartCard;
