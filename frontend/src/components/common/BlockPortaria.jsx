import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function BlockPortaria({ children }) {
  const { isPortaria } = useAuth()

  if (isPortaria) {
    return <Navigate to="/portaria" replace />
  }

  return children
}
