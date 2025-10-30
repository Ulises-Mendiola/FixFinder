import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProfileClient from './pages/ProfileClient.jsx'
import ProfileTech from './pages/ProfileTech.jsx'
import BecomeTechnician from './pages/BecomeTechnician.jsx'
import SuperAdminPanel from './pages/SuperAdminPanel.jsx'
import ServiceRequest from './pages/ServiceRequest.jsx'
import Technicians from './pages/Technicians.jsx'
import './App.css'

const App = () => (
  <AppLayout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile/client"
        element={(
          <ProtectedRoute roles={['client']}>
            <ProfileClient />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile/tech"
        element={(
          <ProtectedRoute roles={['technician']}>
            <ProfileTech />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/become-technician"
        element={(
          <ProtectedRoute roles={['client', 'technician']}>
            <BecomeTechnician />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/requests/new"
        element={(
          <ProtectedRoute roles={['client']}>
            <ServiceRequest />
          </ProtectedRoute>
        )}
      />
      <Route path="/technicians" element={<Technicians />} />
      <Route
        path="/admin"
        element={(
          <ProtectedRoute roles={['superadmin']}>
            <SuperAdminPanel />
          </ProtectedRoute>
        )}
      />
    </Routes>
  </AppLayout>
)

export default App
