import React from "react";
import BarChart from "components/charts/BarChart";
import { barChartOptionsDailyTraffic } from "variables/charts";
import { MdArrowDropUp } from "react-icons/md";
import Card from "components/card";
import api from "lib/mockApi";
const DailyTraffic = () => {
  const [chartData, setChartData] = React.useState([]);
  const [dailyAmount, setDailyAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDailyTraffic = async () => {
      try {
        const response = await api.listApplications({ page: 1, pageSize: 10000 });
        const applications = response.items || [];
        
        // Get today's approved applications
        const today = new Date();
        const todayApprovedApps = applications.filter(app => {
          if (!app.createdAt || app.status !== "APPROVED") return false;
          const appDate = new Date(app.createdAt);
          return appDate.toDateString() === today.toDateString();
        });
        
        // Calculate total amount for today's approved applications
        const totalAmount = todayApprovedApps.reduce((sum, app) => sum + (app.amount || 0), 0);
        setDailyAmount(totalAmount);
        
        // Create hourly amount data (24 hours)
        const hourlyData = Array.from({ length: 7 }, (_, i) => {
          const hour = i * 4; // 0, 4, 8, 12, 16, 20, 24
          const hourApps = todayApprovedApps.filter((app: any) => {
            const appDate = new Date(app.createdAt);
            const appHour = appDate.getHours();
            return appHour >= hour && appHour < hour + 4;
          });
          return hourApps.reduce((sum: number, app: any) => sum + (app.amount || 0), 0) / 1000; // Convert to thousands
        });
        
        const dynamicChartData = [
          {
            name: "Savdo hajmi",
            data: hourlyData,
            color: "#4318FF"
          }
        ];
        
        setChartData(dynamicChartData);
      } catch (error) {
        console.error("Error loading daily traffic:", error);
        // Set fallback data to prevent chart errors
        setChartData([{
          name: "Xarid",
          data: Array(7).fill(0),
          color: "#4318FF"
        }]);
        setDailyAmount(0);
      } finally {
        setLoading(false);
      }
    };

    loadDailyTraffic();
  }, []);
  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600 dark:text-gray-400">Bugungi savdo</p>
          <p className="text-[34px] font-bold text-navy-700 dark:text-white">
            {dailyAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="text-sm font-medium leading-6 text-gray-600 dark:text-gray-400"> UZS</span>
          </p>
        </div>
        <div className="mt-2 flex items-start">
          <div className="flex items-center text-sm text-green-500">
            <MdArrowDropUp className="h-5 w-5" />
            <p className="font-bold"> +2.45% </p>
          </div>
        </div>
      </div>

      <div className="h-full w-full pt-4 pb-0">
        {loading ? (
          <div className="flex h-[200px] w-full items-center justify-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
          </div>
        ) : (
          <BarChart
            chartData={chartData}
            chartOptions={barChartOptionsDailyTraffic}
          />
        )}
      </div>
    </Card>
  );
};

export default DailyTraffic;
