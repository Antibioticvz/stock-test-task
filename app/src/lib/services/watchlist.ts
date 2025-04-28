"use client"
import { auth } from "@/lib/firebase-config"
import { getStockData } from "@/lib/stock-api"
import { StockData } from "@/lib/types/stock"
import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"

export function useWatchlist() {
  const [user] = useAuthState(auth)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [stocksData, setStocksData] = useState<
    Record<string, StockData["data"]>
  >({})
  const [loading, setLoading] = useState(false)

  // Load watchlist from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`watchlist-${user.uid}`)
      if (saved) {
        setWatchlist(JSON.parse(saved))
      }
    }
  }, [user])

  // Fetch data for all stocks in watchlist
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data: Record<string, StockData["data"]> = {}
      for (const symbol of watchlist) {
        try {
          const result = await getStockData(symbol)
          data[symbol] = result.data
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error)
        }
      }
      setStocksData(data)
      setLoading(false)
    }

    if (watchlist.length > 0) {
      fetchData()
    }
  }, [watchlist])

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol) && user) {
      const updated = [...watchlist, symbol]
      setWatchlist(updated)
      localStorage.setItem(`watchlist-${user.uid}`, JSON.stringify(updated))
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    if (user) {
      const updated = watchlist.filter(s => s !== symbol)
      setWatchlist(updated)
      localStorage.setItem(`watchlist-${user.uid}`, JSON.stringify(updated))
    }
  }

  return {
    watchlist,
    stocksData,
    loading,
    addToWatchlist,
    removeFromWatchlist,
  }
}
