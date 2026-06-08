import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { reportWebVitals } from './utils/webVitals'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Report Web Vitals (desenvolvimento apenas)
if (process.env.NODE_ENV === 'development') {
  reportWebVitals()
}
