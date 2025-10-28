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
    const safeSeries = Array.isArray(this.state.chartData) && this.state.chartData.length ? this.state.chartData : [0];
    const isDark = typeof window !== "undefined" && (document.documentElement.classList.contains("dark") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
    const mergedOptions = { ...(this.state.chartOptions || {}) };
    mergedOptions.chart = { ...(mergedOptions.chart || {}), background: "transparent" };
    mergedOptions.theme = { ...(mergedOptions.theme || {}), mode: isDark ? "dark" : "light" };
    mergedOptions.tooltip = { ...(mergedOptions.tooltip || {}), theme: isDark ? "dark" : "light" };

    return (
      <div style={{ minHeight }} className="apexchart-wrapper">
        <ReactApexChart
          options={mergedOptions}
          series={safeSeries}
          type="pie"
          width="100%"
          height={heightProp}
        />
      </div>
    );
  }
}

export default PieChart;
