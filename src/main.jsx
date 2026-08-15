import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Keep the public application boot path completely independent of external
// providers. React/Vite owns startup; Supabase is a data/auth service used
// only by the parts of the application that explicitly need it.
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
