import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import BlockPortaria from './components/common/BlockPortaria'
import RequireRole from './components/common/RequireRole'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateEvent from './pages/CreateEvent'
import MovieDetail from './pages/MovieDetail'
import ShowDetail from './pages/ShowDetail'
import TicketPage from './pages/TicketPage'
import PortariaPage from './pages/PortariaPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <BlockPortaria>
                <Home />
              </BlockPortaria>
            }
          />
          <Route
            path="/login"
            element={
              <BlockPortaria>
                <Login />
              </BlockPortaria>
            }
          />
          <Route
            path="/cadastro"
            element={
              <BlockPortaria>
                <Register />
              </BlockPortaria>
            }
          />
          <Route
            path="/filmes/:id"
            element={
              <BlockPortaria>
                <MovieDetail />
              </BlockPortaria>
            }
          />
          <Route
            path="/eventos/novo"
            element={
              <BlockPortaria>
                <RequireRole role="organizador">
                  <CreateEvent />
                </RequireRole>
              </BlockPortaria>
            }
          />
          <Route
            path="/eventos/:id"
            element={
              <BlockPortaria>
                <ShowDetail />
              </BlockPortaria>
            }
          />
          <Route
            path="/ingresso/:code"
            element={
              <BlockPortaria>
                <TicketPage />
              </BlockPortaria>
            }
          />
          <Route
            path="/portaria"
            element={
              <RequireRole role="portaria">
                <PortariaPage />
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
