"use client"
import { StockData } from "@/lib/types/stock"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface StockChartProps {
  data: StockData["data"]
}

export default function StockChart({ data }: StockChartProps) {
  if (!data) return null

  // Transform data for chart
  const chartData = Object.entries(data)
    .map(([date, values]) => ({
      date,
      price: parseFloat(values["4. close"]),
    }))
    .slice(0, 30)
    .reverse() // Last 30 days

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
