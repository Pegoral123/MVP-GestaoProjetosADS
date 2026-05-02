import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ListaAlunos from './pages/ListaAlunos'
import CadastroAluno from './pages/CadastroAluno'
import CadastroGrupo from './pages/CadastroGrupo'
import ListaGrupos from './pages/ListaGrupos'
import VincularProjeto from './pages/VincularProjeto'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/alunos" element={<ListaAlunos />} />
      <Route path="/alunos/cadastro" element={<CadastroAluno />} />
      <Route path="/alunos/editar/:id" element={<CadastroAluno />} />
      <Route path="/grupos" element={<ListaGrupos />} />
      <Route path="/grupos/cadastro" element={<CadastroGrupo />} />
      <Route path="/grupos/editar/:id" element={<CadastroGrupo />} />
      <Route path="/grupos/:id/vincular-projeto" element={<VincularProjeto />} />

      {/* Rotas privadas */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<><h1>Dashboard</h1></>} />
      </Route>
    </Routes>
  )
}

export default App