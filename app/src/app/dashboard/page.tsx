"use client"
import { auth } from "@/lib/firebase-config"
import { useWatchlist } from "@/lib/services/watchlist"
import { redirect } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!user) {
    redirect("/auth-test")
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
          <div className="h-64 bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Select a stock to view chart</p>
          </div>
        </section>

        {/* Alerts Section */}
        <section className="lg:col-span-3 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Your Alerts</h2>
          <div className="space-y-2">
            {/* Alert items will go here */}
            <p className="text-gray-500">No alerts set up yet</p>
          </div>
        </section>
      </div>
    </div>
  )
}
