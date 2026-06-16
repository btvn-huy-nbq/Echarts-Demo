import { BubbleHeatmapPlot, type BubbleHeatmapData } from "./components/BubbleHeatmapPlot";

function generateBubbleHeatmapData(
  xLabels: string[],
  yLabels: string[],
): BubbleHeatmapData[] {
  const data: BubbleHeatmapData[] = [];

  for (let y = 0; y < yLabels.length; y++) {
    for (let x = 0; x < xLabels.length; x++) {
      const colorValue = (x * 31 + y * 17) % 101;
      const sizeValue = (x * 13 + y * 29) % 101;

      data.push([x, y, colorValue, sizeValue]);
    }
  }

  return data;
}

const xLabels = Array.from({ length: 100 }, (_, index) => `Gene ${index + 1}`);
const yLabels = Array.from({ length: 100 }, (_, index) => `Cell ${index + 1}`);
const bubbleData = generateBubbleHeatmapData(xLabels, yLabels);

function App() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <BubbleHeatmapPlot
        data={bubbleData}
        xLabels={xLabels}
        yLabels={yLabels}
      />
    </div>
  );
}

export default App;
