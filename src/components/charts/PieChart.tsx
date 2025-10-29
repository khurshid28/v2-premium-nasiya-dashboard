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

class PieChart extends React.Component<ChartProps, ChartState> {
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
    const minHeight = this.props.minHeight || 220;
    const heightProp = this.props.height || minHeight;

    // Don't render until we have valid data and options
    if (!this.state.chartData || !Array.isArray(this.state.chartData) || this.state.chartData.length === 0 || !this.state.chartOptions) {
      return <div style={{ minHeight }} className="apexchart-wrapper" />;
    }

    // Ensure we have valid numeric values - pie charts need array of numbers
    const safeSeries = this.state.chartData.map(val => {
      const num = typeof val === 'number' ? val : 0;
      return !isNaN(num) && isFinite(num) ? Math.max(0, num) : 0;
    });
    
    // If all values are 0, show a minimal chart with placeholder data
    const hasData = safeSeries.some(val => val > 0);
    const finalSeries = hasData ? safeSeries : [100, 0, 0];

    const isDark = typeof window !== "undefined" && (document.documentElement.classList.contains("dark") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
    const mergedOptions = { ...(this.state.chartOptions || {}) };
    mergedOptions.chart = { ...(mergedOptions.chart || {}), background: "transparent" };
    mergedOptions.theme = { ...(mergedOptions.theme || {}), mode: isDark ? "dark" : "light" };
    mergedOptions.tooltip = { ...(mergedOptions.tooltip || {}), theme: isDark ? "dark" : "light" };
    
    // Ensure labels exist and match series length
    if (!mergedOptions.labels || !Array.isArray(mergedOptions.labels) || mergedOptions.labels.length !== finalSeries.length) {
      mergedOptions.labels = finalSeries.map((_, i) => `Item ${i + 1}`);
    }

    return (
      <div style={{ minHeight }} className="apexchart-wrapper">
        <ReactApexChart
          options={mergedOptions}
          series={finalSeries}
          type="pie"
          width="100%"
          height={heightProp}
        />
      </div>
    );
  }
}

export default PieChart;
