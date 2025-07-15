import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryTooltip } from "./category-tooltip";
import type { CategorySpending } from "./types";

interface CategoryPieChartProps {
  data: CategorySpending[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="amount"
            label={({ name, percentage }) =>
              `${name} ${percentage.toFixed(1)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CategoryTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}