"use client"
import StockChart from "@/components/stock-chart"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getStockData, searchSymbols } from "@/lib/stock-api"
import { StockData, SymbolSearchResult } from "@/lib/types/stock"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

export default function StockTestPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [data, setData] = useState<StockData | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const results = await searchSymbols(searchQuery)
          setSearchResults(results)
          setShowResults(true)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Search failed")
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

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

  const handleSymbolSelect = (selected: SymbolSearchResult) => {
    setSymbol(selected.symbol)
    setSearchQuery(`${selected.symbol} - ${selected.name}`)
    setShowResults(false)
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Stock Index Viewer</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setShowResults(e.target.value.length > 0)
            }}
            className="w-full p-2 border rounded"
            placeholder="Search for stock symbols (e.g. Apple)"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
              {searchResults.map(result => (
                <div
                  key={result.symbol}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSymbolSelect(result)}
                >
                  <div className="font-medium">{result.symbol}</div>
                  <div className="text-sm text-gray-600">{result.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStockData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "View Data"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {data && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {data.symbol} -{" "}
            {searchResults.find(r => r.symbol === data.symbol)?.name}
          </h2>
          <div className="flex gap-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <StockChart
              data={
                dateRange?.from && dateRange?.to
                  ? Object.fromEntries(
                      Object.entries(data.data).filter(([date]) => {
                        const dateObj = new Date(date)
                        return (
                          dateRange.from &&
                          dateRange.to &&
                          dateObj >= dateRange.from &&
                          dateObj <= dateRange.to
                        )
                      })
                    )
                  : data.data
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
