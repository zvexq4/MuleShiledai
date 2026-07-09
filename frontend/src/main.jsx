import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/dashboard.css";
import "./styles/monitor.css";
import "./styles/accounts.css";
import "./styles/analytics.css";
import "./styles/report.css";
import "./styles/simulator.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)