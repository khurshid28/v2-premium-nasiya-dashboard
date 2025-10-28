import React from "react";
import PieChart from "components/charts/PieChart";
import { pieChartOptions } from "variables/charts";
import Card from "components/card";
import CustomSelect from "components/dropdown/CustomSelect";
import api from "lib/mockApi";

const PieChartCard = () => {
  const [timePeriod, setTimePeriod] = React.useState("monthly");
  const [statusDistribution, setStatusDistribution] = React.useState({
    approved: 0,
    rejected: 0,
    pending: 0,
    total: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStatusData = async () => {
      try {
        const response = await api.listApplications({ page: 1, pageSize: 10000 });
        let applications = response.items || [];
        
        // Filter by time period
        const now = new Date();
        const filtered = applications.filter(app => {
          if (!app.createdAt) return true;
          const createdDate = new Date(app.createdAt);
          
          switch (timePeriod) {
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
          approved: filtered.filter(app => app.status === "APPROVED").length,
          rejected: filtered.filter(app => app.status === "REJECTED").length,
          pending: filtered.filter(app => app.status === "PENDING").length,
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
  }, [timePeriod]);

  const approvedPercent = statusDistribution.total > 0 
    ? Math.round((statusDistribution.approved / statusDistribution.total) * 100) 
    : 0;
  const rejectedPercent = statusDistribution.total > 0 
    ? Math.round((statusDistribution.rejected / statusDistribution.total) * 100) 
    : 0;
  const pendingPercent = statusDistribution.total > 0 
    ? Math.round((statusDistribution.pending / statusDistribution.total) * 100) 
    : 0;

  // Create dynamic chart data with Rejected, Approved, and Pending
  const dynamicChartData = [rejectedPercent, approvedPercent, pendingPercent];
  
  // Ensure we have valid data - if all are 0, show placeholder data
  const hasValidData = dynamicChartData.some(val => val > 0);
  const safeChartData = hasValidData ? dynamicChartData : [100, 0, 0];
  
  const dynamicChartOptions = {
    ...pieChartOptions,
    labels: ["Rad etilgan", "Tasdiqlangan", "Kutilayotgan"],
    colors: ["#EF4444", "#10B981", "#F59E0B"], // Red, Green, Yellow
    fill: {
      ...pieChartOptions.fill,
      colors: ["#EF4444", "#10B981", "#F59E0B"] // Override fill colors too
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
        ) : (
          <PieChart chartOptions={dynamicChartOptions} chartData={safeChartData} series={safeChartData} />
        )}
      </div>
      <div className="flex flex-row !justify-between rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="ml-1 text-sm font-normal text-gray-600 dark:text-gray-300">Rad etilgan</p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
            {rejectedPercent}%
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="ml-1 text-sm font-normal text-gray-600 dark:text-gray-300">Tasdiqlangan</p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700  dark:text-white">
            {approvedPercent}%
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <p className="ml-1 text-sm font-normal text-gray-600 dark:text-gray-300">Kutilayotgan</p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
            {pendingPercent}%
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PieChartCard;
