import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('lifeshieldUser') || 'null'))

  const login = (userData) => {
    localStorage.setItem('lifeshieldUser', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('lifeshieldUser')
    setUser(null)
  }

  const updateUser = (partialUserData) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser

      const mergedUser = { ...currentUser, ...partialUserData }
      localStorage.setItem('lifeshieldUser', JSON.stringify(mergedUser))
      return mergedUser
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
