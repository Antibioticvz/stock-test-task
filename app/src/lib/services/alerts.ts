"use client"
import { auth } from "@/lib/firebase-config"
import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"

export interface Alert {
  id: string
  symbol: string
  price: number
  condition: "above" | "below"
  active: boolean
}

export function useAlerts() {
  const [user] = useAuthState(auth)
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Load alerts from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`alerts-${user.uid}`)
      if (saved) {
        setAlerts(JSON.parse(saved))
      }
    }
  }, [user])

  const addAlert = (alert: Omit<Alert, "id" | "active">) => {
    if (user) {
      const newAlert = {
        ...alert,
        id: Date.now().toString(),
        active: true,
      }
      const updated = [...alerts, newAlert]
      setAlerts(updated)
      localStorage.setItem(`alerts-${user.uid}`, JSON.stringify(updated))
    }
  }

  const removeAlert = (id: string) => {
    if (user) {
      const updated = alerts.filter(a => a.id !== id)
      setAlerts(updated)
      localStorage.setItem(`alerts-${user.uid}`, JSON.stringify(updated))
    }
  }

  const toggleAlert = (id: string) => {
    if (user) {
      const updated = alerts.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      )
      setAlerts(updated)
      localStorage.setItem(`alerts-${user.uid}`, JSON.stringify(updated))
    }
  }

  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
  }
}
