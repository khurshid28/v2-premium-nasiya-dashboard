import React from "react";
import Card from "components/card";
import BarChart from "components/charts/BarChart";
import {
  barChartOptionsWeeklyRevenue,
} from "variables/charts";
import api from "lib/api";
import { MdBarChart } from "react-icons/md";
import { isApproved, isRejected } from "lib/formatters";

interface WeeklyRevenueProps {
  startDate?: string;
  endDate?: string;
  fillialId?: number | "all";
  region?: string;
  search?: string;
  fillials?: any[];
}

const WeeklyRevenue: React.FC<WeeklyRevenueProps> = ({ 
  startDate = "", 
  endDate = "", 
  fillialId = "all", 
  region = "all",
  search = "",
  fillials = []
}) => {
  const [chartData, setChartData] = React.useState([{
    name: "Rad etilgan",
    data: [0, 0, 0, 0, 0, 0, 0],
    color: "#EF4444"
  }, {
    name: "Tasdiqlangan",
    data: [0, 0, 0, 0, 0, 0, 0],
    color: "#10B981"
  }]);
  const [chartOptions, setChartOptions] = React.useState(barChartOptionsWeeklyRevenue);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        const response = await api.listApplications({ page: 1, pageSize: 10000 });
        let applications = response?.items || [];
        
        // Ensure fillials is an array
        const fillialsList = Array.isArray(fillials) ? fillials : [];
        
        // Apply filters
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
        
        // Group by last 7 days (today first, then backwards)
        const today = new Date();
        const weeklyData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000); // Start from 6 days ago to today
          const dayApps = applications.filter(app => {
            if (!app.createdAt) return false;
            const appDate = new Date(app.createdAt);
            return appDate.toDateString() === date.toDateString();
          });
          
          const dayLabel = date.toLocaleDateString('uz-UZ', { weekday: 'short' }) || date.toLocaleDateString('en-US', { weekday: 'short' });
          
          return {
            rejected: dayApps.filter(app => isRejected(app.status)).length,
            approved: dayApps.filter(app => isApproved(app.status)).length,
            date: dayLabel
          };
        }); // No reverse needed - already in chronological order
        
        const dynamicChartData = [
          {
            name: "Rad etilgan",
            data: weeklyData.map(d => d.rejected),
            color: "#EF4444"
          },
          {
            name: "Tasdiqlangan", 
            data: weeklyData.map(d => d.approved),
            color: "#10B981"
          }
        ];
        
        // Create dynamic chart options with current week dates
        const dynamicChartOptions = {
          ...barChartOptionsWeeklyRevenue,
          xaxis: {
            ...barChartOptionsWeeklyRevenue.xaxis,
            categories: weeklyData.map(day => day.date)
          }
        };
        
        setChartData(dynamicChartData);
        setChartOptions(dynamicChartOptions);
      } catch (error) {
        console.error("Error loading weekly data:", error);
        // Set default data if error occurs
        setChartData([{
          name: "Daily Applications",
          data: [0, 0, 0, 0, 0, 0, 0],
          color: "#10B981"
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyData();
  }, [startDate, endDate, fillialId, region, search, fillials]);

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          Haftalik statistika
        </h2>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-full w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <BarChart
              key="weekly-bar-chart"
              chartData={chartData}
              chartOptions={chartOptions}
            />
          ) : (
            <div className="flex items-center justify-center h-[220px]">
              <div className="text-gray-500 dark:text-gray-400">Ma'lumot topilmadi</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WeeklyRevenue;
