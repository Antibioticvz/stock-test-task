"use client"
import StockChart from "@/components/stock-chart"
import { auth } from "@/lib/firebase-config"
import { useAlerts, type Alert } from "@/lib/services/alerts"
import { useWatchlist } from "@/lib/services/watchlist"
import { redirect } from "next/navigation"
import { useState } from "react"
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
  const [newAlert, setNewAlert] = useState<Omit<Alert, "id" | "active">>({
    symbol: "",
    condition: "above",
    price: 0,
  })

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
        {/* Watchlist Section */}
        <section className="lg:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Watchlist</h2>
          <div className="space-y-2">
            {watchlist.length === 0 ? (
              <p className="text-gray-500">No stocks in watchlist yet</p>
            ) : (
              watchlist.map((symbol: string) => (
                <div
                  key={symbol}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <span>{symbol}</span>
                  <button
                    onClick={() => removeFromWatchlist(symbol)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
            <div className="pt-4">
              <input
                type="text"
                placeholder="Add stock symbol"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    addToWatchlist(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Main Chart Section */}
        <section className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Stock Chart</h2>
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
          ) : (
            <StockChart data={stocksData[watchlist[0]]} />
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
