import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ListaAlunos from './pages/ListaAlunos'
import CadastroAluno from './pages/CadastroAluno'
import CadastroGrupo from './pages/CadastroGrupo'
import ListaGrupos from './pages/ListaGrupos'
import VincularProjeto from './pages/VincularProjeto'
import Perfil from './pages/Perfil'
import ListaProjetos from './pages/ListaProjetos'
import ProjetoForm from './pages/ProjetoForm'
import Dashboard from './pages/Dashboard'
import Layout from './components/layout/Layout'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />

        {/* Rotas privadas */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {/*Alunos*/}
            <Route path="/alunos" element={<ListaAlunos />} />
            <Route path="/alunos/cadastro" element={<CadastroAluno />} />
            <Route path="/alunos/editar/:id" element={<CadastroAluno />} />

            {/*Grupos*/}
            <Route path="/grupos" element={<ListaGrupos />} />
            <Route path="/grupos/cadastro" element={<CadastroGrupo />} />
            <Route path="/grupos/editar/:id" element={<CadastroGrupo />} />
            <Route path="/grupos/:id/vincular-projeto" element={<VincularProjeto />} />

            {/*Perfil*/}
            <Route path="/perfil" element={<Perfil />} />

            {/*Projetos*/}
            <Route path="/projetos" element={<ListaProjetos />} />
            <Route path="/projetos/cadastro" element={<ProjetoForm />} />
            <Route path="/projetos/editar/:id" element={<ProjetoForm />} />

            {/*Dashboard*/}
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App