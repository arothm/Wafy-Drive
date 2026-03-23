import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Smartphone } from 'lucide-react'

const APK_URL = 'https://github.com/arothm/Wafy-Drive/releases/latest/download/wafy-drive.apk'
const APP_NAME = 'Wafy Drive'

function isMobileWeb(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  // Don't show if already in native app
  if (ua.includes('wafy')) return false
  return /android|iphone|ipad|ipod|mobile/i.test(ua)
}

export default function AppDownloadBanner() {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('app-banner-dismissed') === 'true')

  if (!isMobileWeb() || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('app-banner-dismissed', 'true')
  }

  return (
    <div className="bg-gold-500 text-neutral-900 px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Smartphone size={18} />
        <span className="font-medium">{t('downloadBanner.message', 'Get {{appName}} for a better experience', { appName: APP_NAME })}</span>
      </div>
      <div className="flex items-center gap-2">
        <a href={APK_URL} className="bg-neutral-900 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-neutral-800 transition-colors">
          {t('downloadBanner.download', 'Download APK')}
        </a>
        <button onClick={dismiss} className="p-1 hover:bg-gold-600 rounded transition-colors" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
