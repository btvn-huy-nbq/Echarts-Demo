import * as echarts from "echarts";
import type {
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
} from "echarts";
import { useEffect, useRef } from "react";

export type ViolinDatum = {
  group: string;
  x: number;
  color: string;
  stats: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  density: [number, number][];
};

type ViolinPlotProps = {
  data: ViolinDatum[];
  width?: number | string;
  height?: number | string;
  violinWidth?: number;
  boxWidth?: number;
};

export function ViolinPlot({
  data,
  width = 600,
  height = 400,
  violinWidth = 0.75,
  boxWidth = 5,
}: ViolinPlotProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const polygonData = data.map((item) => {
      const rightSide = item.density.map(([y, d]) => [
        item.x + d * violinWidth,
        y,
      ]);

      const leftSide = item.density
        .slice()
        .reverse()
        .map(([y, d]) => [item.x - d * violinWidth, y]);

      return {
        x: item.x,
        group: item.group,
        value: [item.x, item.stats.min, item.stats.max],
        points: [...rightSide, ...leftSide],
        left: leftSide,
        right: rightSide,
        stats: item.stats,
        color: `rgb(${item.color})`,
      };
    });

    const xValues = data.map((item) => item.x);
    const minX = Math.min(...xValues) - 0.5;
    const maxX = Math.max(...xValues) + 0.5;
    const minY = Math.min(...data.map((item) => item.stats.min));
    const maxY = Math.max(...data.map((item) => item.stats.max));

    const chart =
      echarts.getInstanceByDom(chartRef.current) ??
      echarts.init(chartRef.current);

    const option = {
      xAxis: {
        type: "value",
        min: minX,
        max: maxX,
      },
      yAxis: {
        type: "value",
        min: minY - 1,
        max: maxY + 1,
      },
      legend: {},
      tooltip: {},
      series: [
        {
          name: "Violinplot",
          type: "custom",
          data: polygonData,
          renderItem(
            params: CustomSeriesRenderItemParams,
            api: CustomSeriesRenderItemAPI,
          ) {
            const item = polygonData[params.dataIndex];

            const centerX = api.coord([item.x, item.stats.min])[0];
            const minPoint = api.coord([item.x, item.stats.min]);
            const q1Point = api.coord([item.x, item.stats.q1]);
            const medianPoint = api.coord([item.x, item.stats.median]);
            const q3Point = api.coord([item.x, item.stats.q3]);
            const maxPoint = api.coord([item.x, item.stats.max]);

            return {
              type: "group",
              children: [
                {
                  type: "polyline",
                  shape: {
                    points: item.left.map(([x, y]) => api.coord([x, y])),
                    smooth: 0.5,
                  },
                  style: {
                    fill: "none",
                    stroke: item.color,
                    lineWidth: 1,
                  },
                },
                {
                  type: "polyline",
                  shape: {
                    points: item.right.map(([x, y]) => api.coord([x, y])),
                    smooth: 0.5,
                  },
                  style: {
                    fill: "none",
                    stroke: item.color,
                    lineWidth: 1,
                  },
                },
                {
                  type: "polyline",
                  shape: {
                    points: [
                      api.coord(item.right[0]),
                      api.coord(item.left[item.left.length - 1]),
                    ],
                  },
                  style: {
                    fill: "none",
                    stroke: item.color,
                    lineWidth: 1,
                  },
                },
                {
                  type: "polyline",
                  shape: {
                    points: [
                      api.coord(item.right[item.right.length - 1]),
                      api.coord(item.left[0]),
                    ],
                  },
                  style: {
                    fill: "none",
                    stroke: item.color,
                    lineWidth: 1,
                  },
                },
                {
                  type: "polyline",
                  shape: {
                    points: item.points.map(([x, y]) => api.coord([x, y])),
                    smooth: 0.5,
                  },
                  style: {
                    fill: item.color,
                    opacity: 0.45,
                  },
                },
                {
                  type: "polyline",
                  shape: {
                    points: [minPoint, maxPoint],
                  },
                  style: {
                    stroke: "black",
                    lineWidth: 1,
                  },
                },
                {
                  type: "rect",
                  shape: {
                    x: centerX - boxWidth / 2,
                    y: q3Point[1],
                    width: boxWidth,
                    height: q1Point[1] - q3Point[1],
                  },
                  style: {
                    stroke: "black",
                    lineWidth: 1,
                    fill: "white",
                  },
                },
                {
                  type: "line",
                  shape: {
                    x1: centerX - boxWidth / 2,
                    y1: medianPoint[1],
                    x2: centerX + boxWidth / 2,
                    y2: medianPoint[1],
                  },
                  style: {
                    stroke: "black",
                    lineWidth: 1.5,
                  },
                },
              ],
            };
          },
        },
      ],
    };

    chart.setOption(option);

    const resizeChart = () => chart.resize();
    window.addEventListener("resize", resizeChart);

    return () => {
      window.removeEventListener("resize", resizeChart);
      chart.dispose();
    };
  }, [boxWidth, data, violinWidth]);

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
