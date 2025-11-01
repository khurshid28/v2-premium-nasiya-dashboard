import React from "react";
import ReactApexChart from "react-apexcharts";

type ChartProps = {
  // using `interface` is also ok
  [x: string]: any;
};
type ChartState = {
  chartData: any[];
  chartOptions: any;
};

class LineChart extends React.Component<ChartProps, ChartState> {
  constructor(props: { chartData: any[]; chartOptions: any }) {
    super(props);

    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.props.chartOptions,
    });
  }

  componentDidUpdate(prevProps: { chartData: any[]; chartOptions: any }) {
    if (prevProps.chartData !== this.props.chartData || prevProps.chartOptions !== this.props.chartOptions) {
      this.setState({ chartData: this.props.chartData, chartOptions: this.props.chartOptions });
    }
  }

  render() {
    // Don't render until we have valid data and options
    if (!this.state.chartData || !Array.isArray(this.state.chartData) || this.state.chartData.length === 0 || !this.state.chartOptions) {
      return <div style={{ minHeight: 220 }} className="apexchart-wrapper" />;
    }

    // Validate that we have proper series structure
    const isValidSeries = this.state.chartData.every(series => 
      series && typeof series === 'object' && Array.isArray(series.data)
    );
    
    if (!isValidSeries) {
      return <div style={{ minHeight: 220 }} className="apexchart-wrapper" />;
    }

    // Ensure all series have valid data arrays with at least one element
    const safeSeries = this.state.chartData.map(series => ({
      ...series,
      name: series.name || 'Data',
      data: Array.isArray(series.data) && series.data.length > 0 
        ? series.data.map((val: any) => typeof val === 'number' && !isNaN(val) ? val : 0)
        : [0]
    }));

    const isDark = typeof window !== "undefined" && (document.documentElement.classList.contains("dark") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
    const mergedOptions = { ...(this.state.chartOptions || {}) };
    mergedOptions.chart = { ...(mergedOptions.chart || {}), background: "transparent" };
    mergedOptions.theme = { ...(mergedOptions.theme || {}), mode: isDark ? "dark" : "light" };
    mergedOptions.tooltip = { ...(mergedOptions.tooltip || {}), theme: isDark ? "dark" : "light" };

    return (
      <ReactApexChart
        options={mergedOptions}
        series={safeSeries}
        type="line"
        width="100%"
        height="100%"
      />
    );
  }
}

export default LineChart;
