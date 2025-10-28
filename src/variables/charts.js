export const barChartDataDailyTraffic = [
  {
    name: "Daily Traffic",
    data: [20, 30, 40, 20, 45, 50, 30],
  },
];

export const barChartOptionsDailyTraffic = {
  chart: {
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    style: {
      fontSize: "12px",
      fontFamily: undefined,
      backgroundColor: "#000000",
    },
    onDatasetHover: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
    },
    theme: "dark",
    y: {
      formatter: function (value) {
        return (value * 1000).toLocaleString() + " UZS"; // Show full amount with currency
      },
    },
  },
  xaxis: {
    categories: ["00", "04", "08", "12", "14", "16", "18"],
    show: false,
    labels: {
      show: true,
      style: {
        colors: "#A3AED0",
        fontSize: "14px",
        fontWeight: "500",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
    color: "black",
    labels: {
      show: true,
      style: {
        colors: "#CBD5E0",
        fontSize: "14px",
      },
    },
  },
  grid: {
    show: false,
    strokeDashArray: 5,
    yaxis: {
      lines: {
        show: true,
      },
    },
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      type: "vertical",
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      colorStops: [
        [
          {
            offset: 0,
            color: "#4318FF",
            opacity: 1,
          },
          {
            offset: 100,
            color: "rgba(67, 24, 255, 1)",
            opacity: 0.28,
          },
        ],
      ],
    },
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: "40px",
    },
  },
};

export const pieChartOptions = {
  labels: ["Your files", "System", "Empty"],
  colors: ["#4318FF", "#6AD2FF", "#EFF4FB"],
  chart: {
    width: "50px",
  },
  states: {
    hover: {
      filter: {
        type: "none",
      },
    },
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  hover: { mode: null },
  plotOptions: {
    donut: {
      expandOnClick: false,
      donut: {
        labels: {
          show: false,
        },
      },
    },
  },
  fill: {
    colors: ["#4318FF", "#6AD2FF", "#EFF4FB"],
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    style: {
      fontSize: "12px",
      fontFamily: undefined,
      backgroundColor: "#000000",
    },
  },
};

export const pieChartData = [63, 25, 12];

export const barChartDataWeeklyRevenue = [
  {
    name: "Rejected",
    data: [150, 120, 180, 140, 160, 190, 170, 130, 200],
    color: "#EF4444", // Red for rejected
  },
  {
    name: "Approved", 
    data: [80, 90, 70, 85, 75, 95, 85, 80, 90],
    color: "#10B981", // Green for approved
  },
  {
    name: "Pending",
    data: [20, 15, 25, 18, 22, 12, 16, 20, 15],
    color: "#F59E0B", // Yellow for pending
  },
];

export const barChartOptionsWeeklyRevenue = {
  chart: {
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  // colors:['#ff3322','#faf']
  tooltip: {
    style: {
      fontSize: "12px",
      fontFamily: undefined,
      backgroundColor: "#000000",
    },
    theme: "dark",
    onDatasetHover: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
    },
    y: {
      formatter: function (value) {
        return value.toFixed(0) + " ta"; // Show count
      },
    },
  },
  xaxis: {
    categories: ["17", "18", "19", "20", "21", "22", "23", "24", "25"],
    show: false,
    labels: {
      show: true,
      style: {
        colors: "#A3AED0",
        fontSize: "14px",
        fontWeight: "500",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: true,
    color: "black",
    labels: {
      show: true,
      style: {
        colors: "#A3AED0",
        fontSize: "12px",
        fontWeight: "500",
      },
      formatter: function (value) {
        return value.toFixed(0); // Show count without suffix
      },
    },
  },

  grid: {
    borderColor: "rgba(163, 174, 208, 0.3)",
    show: true,
    yaxis: {
      lines: {
        show: false,
        opacity: 0.5,
      },
    },
    row: {
      opacity: 0.5,
    },
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  fill: {
    type: "solid",
    colors: ["#5E37FF", "#6AD2FF", "#E1E9F8"],
  },
  legend: {
    show: false,
  },
  colors: ["#5E37FF", "#6AD2FF", "#E1E9F8"],
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: "20px",
    },
  },
};

export const lineChartDataTotalSpent = [
  {
    name: "Revenue",
    data: [50, 64, 48, 66, 49, 68],
    color: "#4318FF",
  },
  {
    name: "Profit",
    data: [30, 40, 24, 46, 20, 46],
    color: "#6AD2FF",
  },
];

export const lineChartOptionsTotalSpent = {
  legend: {
    show: false,
  },

  theme: {
    mode: "light",
  },
  chart: {
    type: "line",

    toolbar: {
      show: false,
    },
  },

  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
  },

  tooltip: {
    style: {
      fontSize: "12px",
      fontFamily: undefined,
      backgroundColor: "#000000",
    },
    theme: "dark",
    x: {
      format: "dd/MM/yy HH:mm",
    },
    y: {
      formatter: function (value) {
        return (value * 1000).toLocaleString() + " UZS"; // Convert back to full amount with currency
      },
    },
  },
  grid: {
    show: false,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: "#A3AED0",
        fontSize: "12px",
        fontWeight: "500",
      },
    },
    type: "text",
    range: undefined,
    categories: ["SEP", "OCT", "NOV", "DEC", "JAN", "FEB"],
  },

  yaxis: {
    show: false,
  },
};
