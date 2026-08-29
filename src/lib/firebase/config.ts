import { getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

export const firebaseConfig = {
  apiKey: 'AIzaSyBO9OhxjdcXUrdo0Ir7z1m9qv6xq2advVw',
  authDomain: 'ekawalselia.firebaseapp.com',
  projectId: 'ekawalselia',
  storageBucket: 'ekawalselia.firebasestorage.app',
  messagingSenderId: '361587280497',
  appId: '1:361587280497:web:a1ecfa4812e05924a829d0',
  measurementId: 'G-8HJMVCGRWF',
}

// Initialize Firebase safely for SSR & Client
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!

export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    return getAnalytics(app)
  }
  return null
}
