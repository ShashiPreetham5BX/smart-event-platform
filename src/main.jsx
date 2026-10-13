import React from 'react'
import ReactDOM from 'react-dom/client'

import { BrowserRouter } from "react-router-dom"

import App from './App'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CityProvider } from './context/CityContext'
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // "development" or "production"
  // Only send events in production — no need to spam yourself with
  // every local dev mistake while you're actively coding.
  enabled: import.meta.env.PROD,
})

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>

    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <ToastProvider>

          <Sentry.ErrorBoundary
            fallback={
              <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-4 p-6 text-center">
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-text-secondary max-w-md">
                  We've been notified and are looking into it. Try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium"
                >
                  Refresh
                </button>
              </div>
            }
          >
            <App />
          </Sentry.ErrorBoundary>

        </ToastProvider>
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>

  </React.StrictMode>

)