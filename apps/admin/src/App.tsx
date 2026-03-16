import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoomsPage from './pages/Rooms';
import UsersPage from './pages/Users';
import { AdminLayout } from './components/layout/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
