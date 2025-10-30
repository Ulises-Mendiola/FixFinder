import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
}

ProtectedRoute.defaultProps = {
  roles: undefined,
}

export default ProtectedRoute
