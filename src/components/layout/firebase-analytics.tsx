'use client'

import { useEffect } from 'react'
import { initAnalytics } from '../../lib/firebase/config'

export function FirebaseAnalytics() {
  useEffect(() => {
    initAnalytics().catch(() => {
      // Analytics initialization silent catch
    })
  }, [])

  return null
}
