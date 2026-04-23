import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ListaAlunos from './pages/ListaAlunos'
import CadastroAluno from './pages/CadastroAluno'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/alunos" element={<ListaAlunos />} />
      <Route path="/alunos/cadastro" element={<CadastroAluno />} />
      <Route path="/alunos/editar/:id" element={<CadastroAluno />} />

      {/* Rotas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<><h1>Dashboard</h1></>} />
      </Route>
    </Routes>
  )
}

export default App