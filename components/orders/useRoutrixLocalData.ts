"use client"

import { useSyncExternalStore } from "react"

import {
  readRoutrixLocalData,
  subscribeRoutrixLocalData,
} from "@/lib/routrix-local-data"

export default function useRoutrixLocalData() {
  return useSyncExternalStore(
    subscribeRoutrixLocalData,
    readRoutrixLocalData,
    readRoutrixLocalData
  )
}
