import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initI18n } from '@wafy/core'
import { Toast } from '@wafy/ui'
import App from './App'
import './index.css'

initI18n()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <App />
      <Toast />
    </BrowserRouter>
  </React.StrictMode>,
)
