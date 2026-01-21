import React from "react";
import * as d3Shape from "d3-shape";

type ChartData = {
  value: number;
  color: string;
};

interface SemiCircleChartProps {
  data: ChartData[];
  size?: number; // Diameter of the chart
}

export const SemiCircleChart: React.FC<SemiCircleChartProps> = ({
  data,
  size = 132,
}) => {
  console.log("SemiCircleChart data:", data);
  const radius = size / 2;

  // Create a pie generator for a semi-circle
  const pie = d3Shape
    .pie<ChartData>()
    .value((d: any) => d.value)
    .startAngle(-Math.PI / 2) // Start at top (-90°)
    .endAngle(Math.PI / 2) // End at bottom (90°) - creates semicircle
    .sort(null);

  const pieData = pie(data);

  const arcGenerator = d3Shape
    .arc<d3Shape.PieArcDatum<ChartData>>()
    .outerRadius(radius)
    .innerRadius(radius - 15) // Can adjust based on desired thickness
    .padAngle(0.03)
    .cornerRadius(4);

  return (
    <svg width={size} height={radius}>
      <g transform={`translate(${radius}, ${radius})`}>
        {pieData.map((slice: any, index: number) => (
          <path
            key={index}
            d={arcGenerator(slice) || undefined}
            fill={slice.data?.color}
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
      </g>
    </svg>
  );
};

export default SemiCircleChart;
