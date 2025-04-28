"use client"
import StockChart from "@/components/stock-chart"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { auth } from "@/lib/firebase-config"
import { useAlerts, type Alert } from "@/lib/services/alerts"
import { useWatchlist } from "@/lib/services/watchlist"
import { searchSymbols } from "@/lib/stock-api"
import { SymbolSearchResult } from "@/lib/types/stock"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { useAuthState } from "react-firebase-hooks/auth"

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)
  const {
    watchlist,
    stocksData,
    loading: stocksLoading,
    addToWatchlist,
    removeFromWatchlist,
  } = useWatchlist()
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlerts()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [newAlert, setNewAlert] = useState<Omit<Alert, "id" | "active">>({
    symbol: "",
    condition: "above",
    price: 0,
  })

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          console.log("Searching for:", searchQuery)
          const results = await searchSymbols(searchQuery)
          console.log("Search results:", results)
          if (results && results.length > 0) {
            setSearchResults(results)
            setShowResults(true)
          } else {
            setSearchResults([])
            setShowResults(false)
          }
        } catch (err) {
          console.error("Search failed:", err)
          setSearchResults([])
          setShowResults(false)
        }
      }, 2000) // Wait 2 seconds after typing stops
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [searchQuery])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!user) {
    redirect("/auth-test")
  }

  const handleAddAlert = () => {
    if (newAlert.symbol && newAlert.price > 0) {
      addAlert(newAlert)
      setNewAlert({
        symbol: "",
        condition: "above",
        price: 0,
      })
    }
  }

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Stock Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.email}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and Watchlist Section */}
        <section className="lg:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Search Stocks</h2>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setShowResults(e.target.value.length > 0)
              }}
              className="w-full p-2 border rounded"
              placeholder="Search for stocks (e.g. Apple)"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                {searchResults.map(result => (
                  <div
                    key={result.symbol}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      addToWatchlist(result.symbol)
                      setSelectedSymbol(result.symbol)
                      setSearchQuery("")
                      setShowResults(false)
                    }}
                  >
                    <div className="font-medium">{result.symbol}</div>
                    <div className="text-sm text-gray-600">{result.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
          <div className="space-y-2">
            {watchlist.length === 0 ? (
              <p className="text-gray-500">No stocks in watchlist yet</p>
            ) : (
              watchlist.map((symbol: string) => (
                <div
                  key={symbol}
                  className={`flex justify-between items-center p-2 border rounded ${
                    selectedSymbol === symbol ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  <span>{symbol}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      removeFromWatchlist(symbol)
                      if (selectedSymbol === symbol) {
                        setSelectedSymbol(null)
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Main Chart Section */}
        <section className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Stock Chart</h2>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Stock Chart</h2>
            {selectedSymbol && (
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange(undefined)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  Reset Dates
                </button>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-100">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, "MMM d")} - ${format(
                            dateRange.to,
                            "MMM d"
                          )}`
                        : "Select Date Range"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          {stocksLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">
                Add stocks to your watchlist to view charts
              </p>
            </div>
          ) : !selectedSymbol ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">
                Select a stock from your watchlist
              </p>
            </div>
          ) : (
            <StockChart
              data={
                dateRange?.from && dateRange?.to && stocksData[selectedSymbol]
                  ? Object.fromEntries(
                      Object.entries(stocksData[selectedSymbol]).filter(
                        ([date]) => {
                          const dateObj = new Date(date)
                          return (
                            dateObj >= dateRange.from! &&
                            dateObj <= dateRange.to!
                          )
                        }
                      )
                    )
                  : stocksData[selectedSymbol]
              }
            />
          )}
        </section>

        {/* Alerts Section */}
        <section className="lg:col-span-3 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Alerts</h2>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-gray-500">No alerts set up yet</p>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <span className="font-medium">{alert.symbol}</span>
                    <span className="text-gray-600 ml-2">
                      {alert.condition === "above" ? ">" : "<"} {alert.price}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        alert.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {alert.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {alert.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="pt-4">
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Symbol"
                  value={newAlert.symbol}
                  onChange={e =>
                    setNewAlert({ ...newAlert, symbol: e.target.value })
                  }
                  className="col-span-1 p-2 border rounded"
                />
                <select
                  className="col-span-1 p-2 border rounded"
                  value={newAlert.condition}
                  onChange={e =>
                    setNewAlert({
                      ...newAlert,
                      condition: e.target.value as "above" | "below",
                    })
                  }
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newAlert.price || ""}
                  onChange={e =>
                    setNewAlert({
                      ...newAlert,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="col-span-1 p-2 border rounded"
                />
                <button
                  onClick={handleAddAlert}
                  className="col-span-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Alert
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
