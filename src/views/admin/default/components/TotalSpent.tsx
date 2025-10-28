import React from "react";
import {
  MdArrowDropUp,
  MdBarChart,
} from "react-icons/md";
import Card from "components/card";
import {
  lineChartOptionsTotalSpent,
} from "variables/charts";
import LineChart from "components/charts/LineChart";
import CustomSelect from "components/dropdown/CustomSelect";
import api from "lib/mockApi";

const TotalSpent = () => {
  const [totalData, setTotalData] = React.useState({
    count: 0,
    totalAmount: 0,
    percent: 0
  });
  const [chartData, setChartData] = React.useState([]);
  const [chartOptions, setChartOptions] = React.useState(lineChartOptionsTotalSpent);
  const [timePeriod, setTimePeriod] = React.useState("6months"); // "2months", "6months", "12months"
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadTotalData = async () => {
      try {
        const response = await api.listApplications({ page: 1, pageSize: 10000 });
        const applications = response.items || [];
        
        // Calculate total count and amount
        const count = applications.length;
        const totalAmount = applications.reduce((sum, app) => sum + (app.amount || 0), 0);
        
        // Calculate growth percentage (mock calculation)
        const percent = 2.45; // +2.45% as shown in the image
        
        setTotalData({ count, totalAmount, percent });
        
        // Generate data based on selected time period
        const now = new Date();
        const monthlyData = [];
        const monthNames = [];
        
        // Determine number of months based on time period
        let monthsCount;
        switch (timePeriod) {
          case "2months": monthsCount = 2; break;
          case "12months": monthsCount = 12; break;
          default: monthsCount = 6; // 6months
        }
        
        for (let i = monthsCount - 1; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(now.getMonth() - i);
          
          const monthApps = applications.filter(app => {
            if (!app.createdAt || app.status !== "APPROVED") return false;
            const appDate = new Date(app.createdAt);
            return appDate.getMonth() === monthDate.getMonth() && 
                   appDate.getFullYear() === monthDate.getFullYear();
          });
          
          const monthTotal = monthApps.reduce((sum, app) => sum + (app.amount || 0), 0);
          monthlyData.push(monthTotal / 1000); // Convert to thousands
          
          // Get month name in short format
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          monthNames.push(monthName);
        }
        
        // Create dynamic chart data structure
        const dynamicChartData = [
          {
            name: "Tasdiqlangan arizalar",
            data: monthlyData,     
            color: "#4318FF"
          }
        ];
        
        // Create dynamic chart options with month names
        const dynamicChartOptions = {
          ...lineChartOptionsTotalSpent,
          xaxis: {
            ...lineChartOptionsTotalSpent.xaxis,
            categories: monthNames
          }
        };
        
        setChartData(dynamicChartData);
        setChartOptions(dynamicChartOptions);
      } catch (error) {
        console.error("Error loading total data:", error);
        // Set default data if error occurs
        setChartData([{
          name: "Total Amount",
          data: Array(6).fill(0)
        }]);
        setTotalData({ count: 0, totalAmount: 0, percent: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadTotalData();
  }, [timePeriod]);
  return (
    <Card extra="!p-[20px] text-center">
      <div className="flex justify-between">
        <CustomSelect
          value={timePeriod}
          onChange={setTimePeriod}
          options={[
            { value: "2months", label: "2 oy" },
            { value: "6months", label: "6 oy" },
            { value: "12months", label: "12 oy" }
          ]}
        />
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-gray-100 p-2 text-brand-500 !transition !duration-200 hover:bg-gray-200 active:bg-gray-300 dark:bg-navy-700 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white">
            {(totalData.totalAmount / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {timePeriod === "2months" ? "2 oylik xarid" : 
               timePeriod === "12months" ? "Yillik xarid" : "6 oylik xarid"}
            </p>
            <div className="flex flex-row items-center justify-center">
              <MdArrowDropUp className={`font-medium ${totalData.percent >= 0 ? "text-green-500" : "text-red-500"}`} />
              <p className={`text-sm font-bold ${totalData.percent >= 0 ? "text-green-500" : "text-red-500"}`}>+{totalData.percent.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
            </div>
          ) : (
            <LineChart
              chartOptions={chartOptions}
              chartData={chartData}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default TotalSpent;
