import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Routes>
      {/* //Rotas públicas */}
      <Route path="/" element={<Login />} />

      {/* //Rotas privadas */}
      <Route element={<PrivateRoute />}>
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} /> */}
        <Route path="/dashboard" element={<><h1>Dashboard</h1></>} />

      </Route>
    </Routes>
  )
}

export default App