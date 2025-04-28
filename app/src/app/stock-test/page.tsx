"use client"
import { getStockData } from "@/lib/stock-api"
import { StockData } from "@/lib/types/stock"
import { useState } from "react"

export default function StockTestPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStockData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStockData(symbol)
      setData(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch stock data"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stock Data Test</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          className="flex-1 p-2 border rounded"
          placeholder="Enter stock symbol (e.g. AAPL)"
        />
        <button
          onClick={fetchStockData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {data && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{data.symbol} Stock Data</h2>
          <div className="bg-white p-4 rounded shadow">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(data.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
