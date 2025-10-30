import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { message } from 'antd'
import api from '../utils/api.js'

const AuthContext = createContext(null)

const storageKey = 'fixfinder_auth'

const readPersistedAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null }
  }
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw)
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
    }
  } catch (error) {
    console.warn('Unable to parse auth from storage', error)
    return { token: null, user: null }
  }
}

export const AuthProvider = ({ children }) => {
  const [{ token, user }, setAuthState] = useState(() => readPersistedAuth())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (!token) {
      localStorage.removeItem(storageKey)
      return
    }
    localStorage.setItem(storageKey, JSON.stringify({ token, user }))
  }, [token, user])

  const handleAuthResponse = useCallback(({ data }) => {
    const nextUser = data.user ?? null
    const nextToken = data.token ?? null
    setAuthState({ user: nextUser, token: nextToken })
    return { user: nextUser, token: nextToken }
  }, [])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', credentials)
      const auth = handleAuthResponse(response)
      message.success(`Bienvenido de nuevo, ${auth.user.profile.fullName}`)
      return auth
    } finally {
      setLoading(false)
    }
  }, [handleAuthResponse])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/register', payload)
      const auth = handleAuthResponse(response)
      message.success('Registro completado correctamente')
      return auth
    } finally {
      setLoading(false)
    }
  }, [handleAuthResponse])

  const logout = useCallback(() => {
    setAuthState({ token: null, user: null })
    message.info('Sesión cerrada')
  }, [])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    loading,
    login,
    register,
    logout,
    setAuthState,
  }), [token, user, loading, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthContext
