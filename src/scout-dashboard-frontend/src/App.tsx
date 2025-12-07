import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppShell from './components/layout/AppShell'
import DashboardOverview from './routes/DashboardOverview'
import TransactionTrends from './routes/TransactionTrends'
import AiAssistant from './routes/AiAssistant'

function App() {
  return (
    <AuthProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/transaction-trends" element={<TransactionTrends />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          {/* Add more routes as needed */}
        </Routes>
      </AppShell>
    </AuthProvider>
  )
}

export default App