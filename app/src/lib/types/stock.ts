export interface StockData {
  symbol: string
  data: {
    [date: string]: {
      "1. open": string
      "2. high": string
      "3. low": string
      "4. close": string
      "5. volume": string
    }
  }
}

export interface SymbolSearchResult {
  symbol: string
  name: string
  type: string
  region: string
}
