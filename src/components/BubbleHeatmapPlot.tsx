import * as echarts from "echarts";
import { useEffect, useRef } from "react";

export type BubbleHeatmapData = [
  xIndex: number,
  yIndex: number,
  colorValue: number,
  sizeValue: number,
];

type BubbleHeatmapPlotProps = {
  data: BubbleHeatmapData[];
  width?: number | string;
  height?: number | string;
  xLabels: string[];
  yLabels: string[];
  minBubbleSize?: number;
  maxCol?: number;
  maxRow?: number;
};

export function BubbleHeatmapPlot({
  data,
  width = 600,
  height = 400,
  xLabels,
  yLabels,
  minBubbleSize = 8,
  maxRow = 8,
  maxCol = 8,
}: BubbleHeatmapPlotProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const colorValues = data.map((item) => item[2]);
  const sizeValues = data.map((item) => item[3]);

  const minColorVal = Math.min(...colorValues);
  const maxColorVal = Math.max(...colorValues);
  const minSizeVal = Math.min(...sizeValues);
  const maxSizeVal = Math.max(...sizeValues);
  useEffect(() => {
    if (!chartRef.current) return;

    const chart =
      echarts.getInstanceByDom(chartRef.current) ??
      echarts.init(chartRef.current);

    const getMaxBubbleSize = () => {
      const cellWidth = ((chartRef.current?.clientWidth ?? 0) * 0.8) / maxCol;
      const cellHeight = ((chartRef.current?.clientHeight ?? 0) * 0.5) / maxRow;

      return Math.max(
        minBubbleSize,
        Math.floor(Math.min(cellWidth, cellHeight) * 0.8),
      );
    };

    const updateChart = () => {
      const maxBubbleSize = getMaxBubbleSize();

      const option: echarts.EChartsOption = {
        grid: {
          height: "50%",
          top: "15%",
          left: "5%",
          right: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: xLabels,
          axisLabel: {
            interval: 0,
          },
          splitLine: {
            show: true,
          },
        },
        yAxis: {
          type: "category",
          data: yLabels,
          axisLabel: {
            interval: 0,
          },
          splitLine: {
            show: true,
          },
        },
        legend: {},
        tooltip: {},
        dataZoom: [
          {
            type: "slider",
            xAxisIndex: 0,
            startValue: 0,
            endValue: maxCol - 1,
            zoomLock: true,
            bottom: "26%",
            brushSelect: false,
          },
          {
            type: "inside",
            xAxisIndex: 0,
            startValue: 0,
            endValue: maxCol - 1,
            zoomLock: true,
            brushSelect: false,
          },
          {
            type: "slider",
            yAxisIndex: 0,
            startValue: 0,
            endValue: maxRow - 1,
            zoomLock: true,
            right: "2%",
            brushSelect: false,
          },
          {
            type: "inside",
            yAxisIndex: 0,
            startValue: 0,
            zoomLock: true,
            endValue: maxRow - 1,
            brushSelect: false,
          },
        ],
        visualMap: [
          {
            calculable: true,
            orient: "horizontal",
            left: "100px",
            bottom: "5%",
            min: minColorVal,
            max: maxColorVal,
            dimension: 2,
          },
          {
            type: "continuous",
            calculable: true,
            orient: "horizontal",
            right: "100px",
            bottom: "5%",
            min: minSizeVal,
            max: maxSizeVal,
            dimension: 3,
            inRange: {
              symbolSize: [minBubbleSize, maxBubbleSize],
            },
          },
        ],

        series: [
          {
            name: "Bubble Heatmap",
            type: "scatter",
            data: data,
          },
        ],
      };

      chart.setOption(option);
    };
    updateChart();
    const resizeChart = () => {
      chart.resize();
      updateChart();
    };
    window.addEventListener("resize", resizeChart);

    return () => {
      window.removeEventListener("resize", resizeChart);
      chart.dispose();
    };
  }, [
    data,
    maxCol,
    maxColorVal,
    maxRow,
    maxSizeVal,
    minBubbleSize,
    minColorVal,
    minSizeVal,
    xLabels,
    yLabels,
  ]);

  return (
    <div
      ref={chartRef}
      style={{
        width,
        height,
        border: "1px solid",
      }}
    />
  );
}
