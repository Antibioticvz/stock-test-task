"use server"

const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
const BASE_URL = "https://www.alphavantage.co/query"

import { StockData } from "./types/stock"

interface SymbolSearchResult {
  symbol: string
  name: string
  type: string
  region: string
}

export async function searchSymbols(
  keywords: string
): Promise<SymbolSearchResult[]> {
  if (!API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    const data = await response.json()

    if (data["Error Message"]) {
      throw new Error(data["Error Message"])
    }

    interface AlphaVantageMatch {
      "1. symbol": string
      "2. name": string
      "3. type": string
      "4. region": string
    }

    return (
      data.bestMatches?.map((match: AlphaVantageMatch) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
      })) || []
    )
  } catch (error) {
    console.error("Failed to search symbols:", error)
    throw error
  }
}

export async function getStockData(symbol: string): Promise<StockData> {
  if (!API_KEY) {
    throw new Error("Alpha Vantage API key not configured")
  }

  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}&outputsize=compact`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    const data = await response.json()

    if (data["Error Message"]) {
      throw new Error(data["Error Message"])
    }

    return {
      symbol,
      data: data["Time Series (Daily)"],
    }
  } catch (error) {
    console.error("Failed to fetch stock data:", error)
    throw error
  }
}
