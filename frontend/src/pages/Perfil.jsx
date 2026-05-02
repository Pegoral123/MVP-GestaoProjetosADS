import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, User, Mail, ShieldCheck, UserPlus, Lock } from "lucide-react"
import { Button } from "../components/ui/button"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

function Perfil() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    // Estados do usuário atual
    const [currentUser, setCurrentUser] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [errorUser, setErrorUser] = useState("")

    // Estados do formulário de novo admin
    const [newAdmin, setNewAdmin] = useState({ username: "", email: "", password: "" })
    const [loadingForm, setLoadingForm] = useState(false)
    const [successForm, setSuccessForm] = useState("")
    const [errorForm, setErrorForm] = useState("")

    // Estados do formulário de alterar senha
    const [pwdData, setPwdData] = useState({ senha_atual: "", nova_senha: "" })
    const [loadingPwd, setLoadingPwd] = useState(false)
    const [successPwd, setSuccessPwd] = useState("")
    const [errorPwd, setErrorPwd] = useState("")

    useEffect(() => {
        // Como a API atual não possui o /auth/users/me/,
        // estamos pegando o username que foi salvo no login.
        const username = localStorage.getItem('logged_username');
        const email = localStorage.getItem('email');
        if (username) {
            setCurrentUser({ username: username, email: email });
        } else {
            setErrorUser("Não foi possível carregar os dados do perfil.");
        }
        setLoadingUser(false);
    }, [])


    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewAdmin(prev => ({ ...prev, [name]: value }))
    }

    const handlePwdChange = (e) => {
        const { name, value } = e.target
        setPwdData(prev => ({ ...prev, [name]: value }))
    }

    const handleRegisterAdmin = async (e) => {
        e.preventDefault()
        setLoadingForm(true)
        setSuccessForm("")
        setErrorForm("")

        try {
            await api.post('/api/v1/auth/register/', newAdmin)
            setSuccessForm(`Usuário ${newAdmin.username} cadastrado com sucesso!`)
            setNewAdmin({ username: "", email: "", password: "" })
        } catch (err) {
            console.error(err)
            const errorMsg = err.response?.data?.username?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.password?.[0] ||
                "Ocorreu um erro ao registrar o usuário."
            setErrorForm(errorMsg)
        } finally {
            setLoadingForm(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setLoadingPwd(true)
        setSuccessPwd("")
        setErrorPwd("")

        try {
            await api.patch('/api/v1/auth/change-password/', pwdData)
            setSuccessPwd("Senha alterada com sucesso!")
            setPwdData({ senha_atual: "", nova_senha: "" })
        } catch (err) {
            console.error(err)
            const errorMsg = err.response?.data?.senha_atual?.[0] ||
                err.response?.data?.nova_senha?.[0] ||
                err.response?.data?.detail ||
                "Ocorreu um erro ao alterar a senha. Verifique sua senha atual."
            setErrorPwd(errorMsg)
        } finally {
            setLoadingPwd(false)
        }
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-[#006b64] text-white px-6 py-4 shadow-md w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            type="button"
                            className="text-white/80 hover:text-white hover:bg-white/20 px-2 cursor-pointer"
                        >
                            <ArrowLeft size={18} className="mr-1" />
                            Voltar
                        </Button>
                        <div className="h-5 w-px bg-white/30 mx-1" />
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} />
                            <h1 className="text-lg font-semibold tracking-wide">Perfil e Administração</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 w-full px-6 py-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Coluna 1: Dados do Usuário e Alterar Senha */}
                <div className="flex flex-col gap-8">
                    {/* Dados do Usuário */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                            <div className="bg-[#006b64]/10 p-3 rounded-full text-[#006b64]">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Meus Dados</h2>
                                <p className="text-sm text-gray-500">Informações do seu perfil atual</p>
                            </div>
                        </div>

                        {loadingUser ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ) : errorUser ? (
                            <p className="text-red-500 text-sm">{errorUser}</p>
                        ) : currentUser ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Nome de Usuário
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <User size={16} className="text-gray-400" />
                                        {currentUser.username}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        E-mail
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <Mail size={16} className="text-gray-400" />
                                        {currentUser.email || "Não informado"}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={logout}
                                        variant="outline"
                                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Sair da conta
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Alterar Senha */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                            <div className="bg-[#006b64]/10 p-3 rounded-full text-[#006b64]">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Alterar Senha</h2>
                                <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
                            </div>
                        </div>

                        {successPwd && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                                <ShieldCheck size={18} />
                                {successPwd}
                            </div>
                        )}

                        {errorPwd && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {errorPwd}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha Atual <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64]">
                                    <div className="bg-gray-50 p-3 border-r border-gray-200">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="senha_atual"
                                        required
                                        value={pwdData.senha_atual}
                                        onChange={handlePwdChange}
                                        className="flex-1 px-3 py-2 text-sm outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nova Senha <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64]">
                                    <div className="bg-gray-50 p-3 border-r border-gray-200">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="nova_senha"
                                        required
                                        value={pwdData.nova_senha}
                                        onChange={handlePwdChange}
                                        className="flex-1 px-3 py-2 text-sm outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loadingPwd}
                                className="w-full bg-[#006b64] hover:bg-[#00524d] mt-2"
                            >
                                {loadingPwd ? "Alterando..." : "Alterar Senha"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Coluna 2: Cadastro de Novo Admin */}
                <div className="flex flex-col gap-8">

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                            <div className="bg-[#006b64]/10 p-3 rounded-full text-[#006b64]">
                                <UserPlus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Novo Administrador</h2>
                                <p className="text-sm text-gray-500">Cadastre outro professor</p>
                            </div>
                        </div>

                        {successForm && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                                <ShieldCheck size={18} />
                                {successForm}
                            </div>
                        )}

                        {errorForm && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                                {errorForm}
                            </div>
                        )}

                        <form onSubmit={handleRegisterAdmin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome de Usuário <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64]">
                                    <div className="bg-gray-50 p-3 border-r border-gray-200">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={newAdmin.username}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2 text-sm outline-none"
                                        placeholder="ex: prof.joao"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mail <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64]">
                                    <div className="bg-gray-50 p-3 border-r border-gray-200">
                                        <Mail size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={newAdmin.email}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2 text-sm outline-none"
                                        placeholder="ex: joao@unifeso.edu.br"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64]">
                                    <div className="bg-gray-50 p-3 border-r border-gray-200">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={newAdmin.password}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2 text-sm outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loadingForm}
                                className="w-full bg-[#006b64] hover:bg-[#00524d] mt-2"
                            >
                                {loadingForm ? "Cadastrando..." : "Cadastrar Administrador"}
                            </Button>
                        </form>
                    </div>
                </div>

            </main>
        </section>
    )
}

export default Perfil
