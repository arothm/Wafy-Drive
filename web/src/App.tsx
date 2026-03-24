import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@wafy/core'
import { Spinner } from '@wafy/ui'
import DrivePage from './pages/DrivePage'
import AppDownloadBanner from './components/AppDownloadBanner'

export default function App() {
  const { user, fetchUser } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUser().finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>
  if (!user) { window.location.href = 'https://wafy.life/login'; return null }

  return (
    <>
      <AppDownloadBanner />
      <Routes>
        <Route path="/*" element={<DrivePage />} />
      </Routes>
    </>
  )
}
