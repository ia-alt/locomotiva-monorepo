import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoomsPage from './pages/Rooms';
import UsersPage from './pages/Users';
import AccessControlPage from './pages/AccessControl';
import FrequencyReport from './pages/FrequencyReport';
import AccessHistoryPage from './pages/AccessHistory';
import BookingsPage from './pages/Bookings';
import SettingsPage from './pages/Settings';
import ReportPage from './pages/Report';
import PrintRequestsPage from './pages/PrintRequests';
import PrintersPage from './pages/Printers';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with AdminLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/access-control" element={<AccessControlPage />} />
            <Route path="/frequency-report" element={<FrequencyReport />} />
            <Route path="/access-history" element={<AccessHistoryPage />} />
            <Route path="/reservations" element={<BookingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/print-requests" element={<PrintRequestsPage />} />
            <Route path="/printers" element={<PrintersPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
