import { useEffect, useRef, useState } from 'react'
import {
  connectPriceSocket,
  subscribeTicks,
  unsubscribeTicks,
  subscribeConnection,
  unsubscribeConnection,
} from '../services/priceSocket'

export function useTickStream(apiKey) {
  const [latestTick, setLatestTick] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const idRef = useRef(`tick-${Date.now()}`)
  const connIdRef = useRef(`conn-${Date.now()}`)

  useEffect(() => {
    if (!apiKey) return
    connectPriceSocket(apiKey)
    subscribeTicks(idRef.current, (tick) => {
      setLatestTick(tick)
    })
    subscribeConnection(connIdRef.current, (status) => {
      setIsConnected(status)
    })
    return () => {
      unsubscribeTicks(idRef.current)
      unsubscribeConnection(connIdRef.current)
    }
  }, [apiKey])

  return { latestTick, isConnected }
}

export function useSocketStatus(apiKey) {
  const [isConnected, setIsConnected] = useState(false)
  const connIdRef = useRef(`conn-${Date.now()}`)

  useEffect(() => {
    if (!apiKey) return
    connectPriceSocket(apiKey)
    subscribeConnection(connIdRef.current, (status) => {
      setIsConnected(status)
    })
    return () => {
      unsubscribeConnection(connIdRef.current)
    }
  }, [apiKey])

  return isConnected
}
