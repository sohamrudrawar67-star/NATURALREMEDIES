'use client'

import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/** True only on the client, after hydration. Guards persisted (localStorage) state. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}
