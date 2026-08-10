import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RequireRole from './components/common/RequireRole'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateEvent from './pages/CreateEvent'
import MovieDetail from './pages/MovieDetail'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/filmes/:id" element={<MovieDetail />} />
          <Route
            path="/eventos/novo"
            element={
              <RequireRole role="organizador">
                <CreateEvent />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
