declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_CLIENT = String(import.meta.env.VITE_ADSENSE_CLIENT ?? 'ca-pub-1224030144383381').trim()
const ADSENSE_SCRIPT_ID = 'arkti-adsense-script'

export function getAdsenseClient() {
  return ADSENSE_CLIENT
}

export function hasAdsenseClient() {
  return ADSENSE_CLIENT.length > 0
}

export function ensureAdsenseScript() {
  if (!hasAdsenseClient() || typeof document === 'undefined') {
    return
  }

  if (
    document.getElementById(ADSENSE_SCRIPT_ID) ||
    document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')
  ) {
    return
  }

  const script = document.createElement('script')
  script.id = ADSENSE_SCRIPT_ID
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

export function requestAdsenseSlot() {
  if (!hasAdsenseClient() || typeof window === 'undefined') {
    return
  }

  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (error) {
    console.error('AdSense slot request failed:', error)
  }
}
